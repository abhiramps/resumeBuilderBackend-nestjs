import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    private async getBrowser(): Promise<Browser> {
        const isOffline = process.env.IS_OFFLINE;
        const isLambda = !isOffline && (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.AWS_EXECUTION_ENV);

        let executablePath: string;
        let args: string[] = [];

        if (isLambda) {
            this.logger.log('Running in Lambda environment');
            executablePath = await chromium.executablePath();

            if (!executablePath) {
                throw new Error('Chromium executable path is undefined');
            }

            args = [
                ...chromium.args,
                '--disable-dev-shm-usage',
                '--single-process',
            ];
        } else {
            this.logger.log('Running in local environment');
            const platform = process.platform;
            if (platform === 'darwin') {
                executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else if (platform === 'win32') {
                executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            } else {
                executablePath = '/usr/bin/google-chrome';
            }
        }

        return puppeteer.launch({
            args,
            defaultViewport: { width: 1920, height: 1080 },
            executablePath,
            headless: true,
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
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
