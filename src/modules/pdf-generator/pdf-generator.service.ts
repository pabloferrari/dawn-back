// src/modules/pdf-generator/pdf-generator.service.ts
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TemplateService } from '../templates/template.service';

@Injectable()
export class PdfGeneratorService {
  constructor(private readonly templateService: TemplateService) { }

  async launchBrowser(): Promise<puppeteer.Browser> {
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async generatePage(
    browser: puppeteer.Browser,
    productType: string,
    templateName: string,
    data: any,
  ): Promise<Buffer> {
    const page = await browser.newPage();

    const html = await this.templateService.compile(productType, templateName, data);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true, // AGREGADO: Respeta el @page size del CSS
    });

    await page.close();
    return Buffer.from(pdfBuffer);
  }

  async mergePdfs(pdfBuffers: Buffer[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
  }

  async savePdf(
    pdfBytes: Uint8Array,
    productType: string,
    fileName: string,
  ): Promise<string> {
    // CORREGIDO: Construcción correcta del path
    const outputDir = path.join(process.cwd(), 'output', productType);
    await fs.mkdir(outputDir, { recursive: true });

    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, pdfBytes);

    return filePath;
  }
}