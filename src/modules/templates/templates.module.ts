// src/modules/templates/template.module.ts
import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';

@Module({
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule { }