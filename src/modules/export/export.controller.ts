import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { Logger } from 'winston';

@ApiTags('export')
@Controller('resumes/export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Post()
    @ApiOperation({ summary: 'Export resume as PDF' })
    async exportPdf(
        @Res() res: Response,
        @Body() body: { html: string; css?: string },
    ) {
        try {
            const { html, css } = body;

            if (!html) {
                res.status(400).json({ success: false, message: 'HTML content is required' });
                return;
            }

            console.log('Generating PDF...');
            const pdfBuffer = await this.exportService.generatePdf(html, css || '');

            console.log('PDF generated successfully, size:', pdfBuffer.length);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Export handler error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
