// src/modules/pdf-generator/pdf-generator.module.ts
import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { TemplateModule } from '../templates/templates.module';

@Module({
  imports: [TemplateModule],
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule { }