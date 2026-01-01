import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VersionsService {
    constructor(private prisma: PrismaService) { }

    async list(resumeId: string, userId: string) {
        await this.verifyResumeOwnership(resumeId, userId);

        const versions = await this.prisma.resumeVersion.findMany({
            where: { resumeId },
            orderBy: { versionNumber: 'desc' },
        });

        return versions;
    }

    async create(resumeId: string, userId: string, data: any) {
        await this.verifyResumeOwnership(resumeId, userId);

        const resume = await this.prisma.resume.findUnique({
            where: { id: resumeId },
        });

        if (!resume) {
            throw new NotFoundException('Resume not found');
        }

        const latestVersion = await this.prisma.resumeVersion.findFirst({
            where: { resumeId },
            orderBy: { versionNumber: 'desc' },
        });

        const versionNumber = (latestVersion?.versionNumber || 0) + 1;

        const version = await this.prisma.resumeVersion.create({
            data: {
                resumeId,
                userId,
                versionNumber,
                versionName: data.versionName,
                content: resume.content as Prisma.InputJsonValue,
                templateId: resume.templateId,
                changesSummary: data.changesSummary,
                createdBy: userId,
            },
        });

        return version;
    }

    async getById(versionId: string, resumeId: string, userId: string) {
        await this.verifyResumeOwnership(resumeId, userId);

        const version = await this.prisma.resumeVersion.findFirst({
            where: {
                id: versionId,
                resumeId,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        return version;
    }

    async restore(versionId: string, resumeId: string, userId: string) {
        const version = await this.getById(versionId, resumeId, userId);

        const resume = await this.prisma.resume.update({
            where: { id: resumeId },
            data: {
                content: version.content as Prisma.InputJsonValue,
                templateId: version.templateId,
            },
        });

        return resume;
    }

    private async verifyResumeOwnership(resumeId: string, userId: string) {
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
    }
}
