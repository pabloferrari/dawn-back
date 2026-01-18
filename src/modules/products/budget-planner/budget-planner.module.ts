// src/modules/products/budget-planner/budget-planner.module.ts
import { Module } from '@nestjs/common';
import { BudgetPlannerController } from './budget-planner.controller';
import { BudgetPlannerService } from './budget-planner.service';
import { PdfGeneratorModule } from '../../pdf-generator/pdf-generator.module';

@Module({
  imports: [PdfGeneratorModule],
  controllers: [BudgetPlannerController],
  providers: [BudgetPlannerService],
})
export class BudgetPlannerModule { }