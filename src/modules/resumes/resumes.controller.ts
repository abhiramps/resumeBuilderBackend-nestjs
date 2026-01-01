import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
    CreateResumeDto,
    UpdateResumeDto,
    ListResumesQueryDto,
    SearchResumesQueryDto,
} from './dto/resume.dto';

@ApiTags('resumes')
@Controller('resumes')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ResumesController {
    constructor(private readonly resumesService: ResumesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new resume' })
    async create(@Req() req: any, @Body() createResumeDto: CreateResumeDto) {
        const resume = await this.resumesService.create(req.user.id, createResumeDto);
        return { data: resume };
    }

    @Get()
    @ApiOperation({ summary: 'List all resumes' })
    async list(@Req() req: any, @Query() query: ListResumesQueryDto) {
        const result = await this.resumesService.list(req.user.id, query);
        const page = query.page || 1;
        const limit = query.limit || 10;

        return {
            data: result.resumes,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }

    @Get('search')
    @ApiOperation({ summary: 'Search resumes' })
    async search(@Req() req: any, @Query() query: SearchResumesQueryDto) {
        const result = await this.resumesService.search(req.user.id, query.q, query);
        const page = query.page || 1;
        const limit = query.limit || 10;

        return {
            data: result.resumes,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get resume by ID' })
    async getById(@Req() req: any, @Param('id') id: string) {
        const resume = await this.resumesService.getById(id, req.user.id);
        return { data: resume };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update resume' })
    async update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() updateResumeDto: UpdateResumeDto,
    ) {
        const resume = await this.resumesService.update(id, req.user.id, updateResumeDto);
        return { data: resume };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete resume' })
    async delete(@Req() req: any, @Param('id') id: string) {
        await this.resumesService.delete(id, req.user.id);
        return { message: 'Resume deleted successfully' };
    }

    @Post(':id/duplicate')
    @ApiOperation({ summary: 'Duplicate resume' })
    async duplicate(@Req() req: any, @Param('id') id: string) {
        const resume = await this.resumesService.duplicate(id, req.user.id);
        return { data: resume };
    }

    @Get(':id/export')
    @ApiOperation({ summary: 'Export resume' })
    async export(@Req() req: any, @Param('id') id: string) {
        const data = await this.resumesService.export(id, req.user.id);
        return { data };
    }

    @Post('import')
    @ApiOperation({ summary: 'Import resume' })
    async import(@Req() req: any, @Body() importData: any) {
        const resume = await this.resumesService.import(req.user.id, importData);
        return { data: resume };
    }

    @Post('bulk-export')
    @ApiOperation({ summary: 'Bulk export resumes' })
    async bulkExport(@Req() req: any, @Body() body: { resumeIds: string[] }) {
        const data = await this.resumesService.bulkExport(req.user.id, body.resumeIds);
        return { data };
    }
}
