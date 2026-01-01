import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.serializeBigInt(user);
    }

    async update(userId: string, updates: any) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updates,
        });

        return this.serializeBigInt(user);
    }

    async delete(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date(), isActive: false },
        });
    }

    async getStats(userId: string) {
        const user = await this.getById(userId);
        const resumeCount = await this.prisma.resume.count({
            where: { userId, deletedAt: null },
        });

        return {
            resumeCount,
            exportCount: user.exportCount,
            storageUsedBytes: user.storageUsedBytes,
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
        };
    }

    private serializeBigInt(obj: any): any {
        return JSON.parse(
            JSON.stringify(obj, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            ),
        );
    }
}
