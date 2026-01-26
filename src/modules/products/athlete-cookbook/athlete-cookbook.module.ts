// src/modules/products/athlete-cookbook/athlete-cookbook.module.ts
import { Module } from '@nestjs/common';
import { AthleteCookbookController } from './athlete-cookbook.controller';
import { AthleteCookbookService } from './athlete-cookbook.service';
import { PdfGeneratorModule } from '../../pdf-generator/pdf-generator.module';

@Module({
  imports: [PdfGeneratorModule],
  controllers: [AthleteCookbookController],
  providers: [AthleteCookbookService],
})
export class AthleteCookbookModule {}
