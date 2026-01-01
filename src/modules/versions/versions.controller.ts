import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VersionsService } from './versions.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('versions')
@Controller('resumes/:resumeId/versions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class VersionsController {
    constructor(private readonly versionsService: VersionsService) { }

    @Get()
    @ApiOperation({ summary: 'List all versions of a resume' })
    async list(@Req() req: any, @Param('resumeId') resumeId: string) {
        const versions = await this.versionsService.list(resumeId, req.user.id);
        return { data: versions };
    }

    @Post()
    @ApiOperation({ summary: 'Create a new version' })
    async create(
        @Req() req: any,
        @Param('resumeId') resumeId: string,
        @Body() body: any,
    ) {
        const version = await this.versionsService.create(resumeId, req.user.id, body);
        return { data: version };
    }

    @Get(':versionId')
    @ApiOperation({ summary: 'Get a specific version' })
    async getById(
        @Req() req: any,
        @Param('resumeId') resumeId: string,
        @Param('versionId') versionId: string,
    ) {
        const version = await this.versionsService.getById(versionId, resumeId, req.user.id);
        return { data: version };
    }

    @Post(':versionId/restore')
    @ApiOperation({ summary: 'Restore a version' })
    async restore(
        @Req() req: any,
        @Param('resumeId') resumeId: string,
        @Param('versionId') versionId: string,
    ) {
        const resume = await this.versionsService.restore(versionId, resumeId, req.user.id);
        return { data: resume };
    }
}
