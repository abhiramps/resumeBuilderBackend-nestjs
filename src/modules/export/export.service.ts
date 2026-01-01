import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    private async getBrowser(): Promise<Browser> {
        return puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });
    }

    async generatePdf(html: string, css: string): Promise<Buffer> {
        let browser: Browser | null = null;

        try {
            browser = await this.getBrowser();
            const page = await browser.newPage();

            // Wrap content in full HTML structure with proper styles
            const fullHtml = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <style>
                      /* Tailwind-like base reset */
                      *, ::before, ::after {
                        box-sizing: border-box;
                        border-width: 0;
                        border-style: solid;
                        border-color: #e5e7eb;
                      }
                      html, body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                      }
                      /* Inject received CSS */
                      ${css}
                    </style>
                  </head>
                  <body>
                    ${html}
                  </body>
                </html>
            `;

            // Set content and wait for fonts to load
            await page.setContent(fullHtml, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });

            // Wait for fonts to be loaded
            await page.evaluateHandle('document.fonts.ready');

            const pdfBuffer = await page.pdf({
                format: 'Letter',
                printBackground: true,
                displayHeaderFooter: false,
                margin: {
                    top: '0px',
                    bottom: '0px',
                    left: '0px',
                    right: '0px',
                },
                preferCSSPageSize: true,
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            this.logger.error('Failed to generate PDF:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
