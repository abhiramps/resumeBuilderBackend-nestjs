import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { CreateResumeDto, UpdateResumeDto, ListResumesQueryDto } from './dto/resume.dto';

@Injectable()
export class ResumesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: CreateResumeDto) {
        const canCreate = await this.checkSubscriptionLimits(userId, 'max_resumes');
        if (!canCreate) {
            throw new ForbiddenException('Resume limit reached for your subscription tier');
        }

        const resume = await this.prisma.resume.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                templateId: data.templateId || 'modern',
                content: (data.content || {}) as Prisma.InputJsonValue,
                status: 'draft',
            },
        });

        await this.updateResumeCount(userId);
        return resume;
    }

    async getById(resumeId: string, userId: string) {
        const resume = await this.prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId,
                deletedAt: null,
            },
        });

        if (!resume) {
            throw new NotFoundException('Resume not found');
        }

        return resume;
    }

    async list(userId: string, options: ListResumesQueryDto = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            template,
            sortBy = 'updatedAt',
            sortOrder = 'desc',
        } = options;
        const offset = (page - 1) * limit;

        const where: Prisma.ResumeWhereInput = {
            userId,
            deletedAt: null,
            ...(status && { status }),
            ...(template && { templateId: template }),
        };

        const orderBy: Prisma.ResumeOrderByWithRelationInput = {};
        if (sortBy === 'title') {
            orderBy.title = sortOrder;
        } else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        } else {
            orderBy.updatedAt = sortOrder;
        }

        const [resumes, total] = await Promise.all([
            this.prisma.resume.findMany({
                where,
                orderBy,
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    userId: true,
                    title: true,
                    description: true,
                    templateId: true,
                    status: true,
                    isPublic: true,
                    publicSlug: true,
                    atsScore: true,
                    viewCount: true,
                    exportCount: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.resume.count({ where }),
        ]);

        return { resumes, total };
    }

    async search(userId: string, query: string, options: any = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            template,
            sortBy = 'relevance',
            sortOrder = 'desc',
        } = options;
        const offset = (page - 1) * limit;

        const searchTerms = query.trim().toLowerCase();

        if (!searchTerms) {
            return this.list(userId, {
                ...options,
                sortBy: sortBy === 'relevance' ? 'updatedAt' : sortBy,
            });
        }

        const where: Prisma.ResumeWhereInput = {
            userId,
            deletedAt: null,
            ...(status && { status }),
            ...(template && { templateId: template }),
            OR: [
                {
                    title: {
                        contains: searchTerms,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: searchTerms,
                        mode: 'insensitive',
                    },
                },
            ],
        };

        let orderBy: Prisma.ResumeOrderByWithRelationInput = {};
        if (sortBy === 'relevance') {
            orderBy = { updatedAt: 'desc' };
        } else if (sortBy === 'title') {
            orderBy.title = sortOrder;
        } else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        } else {
            orderBy.updatedAt = sortOrder;
        }

        const [resumes, total] = await Promise.all([
            this.prisma.resume.findMany({
                where,
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.resume.count({ where }),
        ]);

        return { resumes, total };
    }

    async update(resumeId: string, userId: string, updates: UpdateResumeDto) {
        await this.getById(resumeId, userId);

        const updateData: Prisma.ResumeUpdateInput = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.templateId !== undefined) updateData.templateId = updates.templateId;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.content !== undefined) updateData.content = updates.content as Prisma.InputJsonValue;
        if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

        const resume = await this.prisma.resume.update({
            where: { id: resumeId },
            data: updateData,
        });

        return resume;
    }

    async delete(resumeId: string, userId: string): Promise<void> {
        await this.getById(resumeId, userId);

        await this.prisma.resume.update({
            where: { id: resumeId },
            data: { deletedAt: new Date() },
        });

        await this.updateResumeCount(userId);
    }

    async duplicate(resumeId: string, userId: string) {
        const original = await this.getById(resumeId, userId);

        const canCreate = await this.checkSubscriptionLimits(userId, 'max_resumes');
        if (!canCreate) {
            throw new ForbiddenException('Resume limit reached for your subscription tier');
        }

        const duplicate = await this.prisma.resume.create({
            data: {
                userId,
                title: `${original.title} (Copy)`,
                description: original.description,
                templateId: original.templateId,
                content: original.content as Prisma.InputJsonValue,
                status: 'draft',
            },
        });

        await this.updateResumeCount(userId);
        return duplicate;
    }

    async export(resumeId: string, userId: string) {
        const resume = await this.getById(resumeId, userId);

        await this.prisma.resume.update({
            where: { id: resumeId },
            data: {
                exportCount: { increment: 1 },
                lastExportedAt: new Date(),
            },
        });

        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            resume: {
                title: resume.title,
                templateId: resume.templateId,
                content: resume.content,
                status: resume.status,
            },
        };
    }

    async import(userId: string, data: any) {
        if (!data.resume || !data.resume.content) {
            throw new BadRequestException('Invalid import data: resume content is required');
        }

        if (data.version && data.version !== '1.0') {
            throw new BadRequestException(`Unsupported import version: ${data.version}`);
        }

        const canCreate = await this.checkSubscriptionLimits(userId, 'max_resumes');
        if (!canCreate) {
            throw new ForbiddenException('Resume limit reached for your subscription tier');
        }

        const resume = await this.prisma.resume.create({
            data: {
                userId,
                title: data.resume.title || 'Imported Resume',
                templateId: data.resume.templateId || 'modern',
                content: data.resume.content as Prisma.InputJsonValue,
                status: 'draft',
            },
        });

        await this.updateResumeCount(userId);
        return resume;
    }

    async bulkExport(userId: string, resumeIds?: string[]) {
        const where: Prisma.ResumeWhereInput = {
            userId,
            deletedAt: null,
            ...(resumeIds && resumeIds.length > 0 && { id: { in: resumeIds } }),
        };

        const resumes = await this.prisma.resume.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
        });

        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            resumes: resumes.map((resume) => ({
                id: resume.id,
                title: resume.title,
                templateId: resume.templateId,
                content: resume.content,
                status: resume.status,
                createdAt: resume.createdAt.toISOString(),
                updatedAt: resume.updatedAt.toISOString(),
            })),
        };
    }

    private async updateResumeCount(userId: string): Promise<void> {
        const count = await this.prisma.resume.count({
            where: {
                userId,
                deletedAt: null,
            },
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: { resumeCount: count },
        });
    }

    private async checkSubscriptionLimits(userId: string, limitType: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionTier: true, resumeCount: true },
        });

        if (!user) return false;

        const limits: Record<string, Record<string, number>> = {
            free: { max_resumes: 3 },
            basic: { max_resumes: 10 },
            pro: { max_resumes: 50 },
            enterprise: { max_resumes: 999999 },
        };

        const tierLimits = limits[user.subscriptionTier] || limits.free;
        const limit = tierLimits[limitType];

        if (limitType === 'max_resumes') {
            return user.resumeCount < limit;
        }

        return true;
    }
}
