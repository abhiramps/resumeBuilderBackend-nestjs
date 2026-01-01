import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SharingService } from './sharing.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('sharing')
@Controller()
export class SharingController {
    constructor(private readonly sharingService: SharingService) { }

    @Post('resumes/:id/share')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Share a resume publicly' })
    async share(@Req() req: any, @Param('id') id: string) {
        const result = await this.sharingService.share(id, req.user.id);
        return { data: result };
    }

    @Post('resumes/:id/unshare')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unshare a resume' })
    async unshare(@Req() req: any, @Param('id') id: string) {
        await this.sharingService.unshare(id, req.user.id);
        return { message: 'Resume unshared successfully' };
    }

    @Get('resumes/:id/analytics')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get resume analytics' })
    async getAnalytics(@Req() req: any, @Param('id') id: string) {
        const analytics = await this.sharingService.getAnalytics(id, req.user.id);
        return { data: analytics };
    }

    @Get('public/:slug')
    @ApiOperation({ summary: 'Get public resume by slug' })
    async getPublicResume(@Param('slug') slug: string) {
        const resume = await this.sharingService.getPublicResume(slug);
        return { data: resume };
    }
}
