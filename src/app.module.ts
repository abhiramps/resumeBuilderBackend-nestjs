import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { VersionsModule } from './modules/versions/versions.module';
import { SharingModule } from './modules/sharing/sharing.module';
import { ExportModule } from './modules/export/export.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        ResumesModule,
        VersionsModule,
        SharingModule,
        ExportModule,
        HealthModule,
    ],
})
export class AppModule { }
