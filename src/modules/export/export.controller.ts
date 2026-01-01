import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('export')
@Controller('resumes/export')
export class ExportController {
    private readonly logger = new Logger(ExportController.name);

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

            this.logger.log('Generating PDF...');
            const pdfBuffer = await this.exportService.generatePdf(html, css || '');

            this.logger.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
            res.send(pdfBuffer);
        } catch (error) {
            this.logger.error('Export handler error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
