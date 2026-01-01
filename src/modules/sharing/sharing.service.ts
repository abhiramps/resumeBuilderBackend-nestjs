import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class SharingService {
    constructor(private prisma: PrismaService) { }

    async share(resumeId: string, userId: string) {
        const resume = await this.verifyOwnership(resumeId, userId);

        if (resume.isPublic && resume.publicSlug) {
            return {
                slug: resume.publicSlug,
                url: `${process.env.FRONTEND_URL}/public/${resume.publicSlug}`,
                isPublic: true,
            };
        }

        const slug = nanoid(12);

        await this.prisma.resume.update({
            where: { id: resumeId },
            data: {
                isPublic: true,
                publicSlug: slug,
            },
        });

        return {
            slug,
            url: `${process.env.FRONTEND_URL}/public/${slug}`,
            isPublic: true,
        };
    }

    async unshare(resumeId: string, userId: string): Promise<void> {
        await this.verifyOwnership(resumeId, userId);

        await this.prisma.resume.update({
            where: { id: resumeId },
            data: {
                isPublic: false,
                publicSlug: null,
            },
        });
    }

    async getPublicResume(slug: string) {
        const resume = await this.prisma.resume.findFirst({
            where: {
                publicSlug: slug,
                isPublic: true,
                deletedAt: null,
            },
        });

        if (!resume) {
            throw new NotFoundException('Public resume not found');
        }

        await this.prisma.resume.update({
            where: { id: resume.id },
            data: { viewCount: { increment: 1 } },
        });

        return {
            id: resume.id,
            title: resume.title,
            templateId: resume.templateId,
            content: resume.content,
            viewCount: resume.viewCount + 1,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
        };
    }

    async getAnalytics(resumeId: string, userId: string) {
        const resume = await this.verifyOwnership(resumeId, userId);

        return {
            resumeId: resume.id,
            viewCount: resume.viewCount,
            exportCount: resume.exportCount,
            lastViewedAt: null,
            lastExportedAt: resume.lastExportedAt,
        };
    }

    private async verifyOwnership(resumeId: string, userId: string) {
        const resume = await this.prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId,
                deletedAt: null,
            },
        });

        if (!resume) {
            throw new ForbiddenException('Access denied');
        }

        return resume;
    }
}
