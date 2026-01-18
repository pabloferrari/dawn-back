// src/modules/products/baby-sign/baby-sign.module.ts
import { Module } from '@nestjs/common';
import { BabySignController } from './baby-sign.controller';
import { BabySignService } from './baby-sign.service';
import { PdfGeneratorModule } from '../../pdf-generator/pdf-generator.module';

@Module({
  imports: [PdfGeneratorModule],
  controllers: [BabySignController],
  providers: [BabySignService],
})
export class BabySignModule { }