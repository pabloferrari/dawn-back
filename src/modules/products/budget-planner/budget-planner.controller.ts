// src/modules/products/budget-planner/budget-planner.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { BudgetPlannerService } from './budget-planner.service';
import * as budgetPlannerConfigInterface from './interfaces/budget-planner-config.interface';

@Controller('products/budget-planner')
export class BudgetPlannerController {
  constructor(private readonly budgetPlannerService: BudgetPlannerService) {}

  @Post('generate')
  async generate(@Body() config: budgetPlannerConfigInterface.BudgetPlannerConfig) {
    try {
      if (!this.budgetPlannerService.validateConfig(config)) {
        return {
          success: false,
          message: 'Invalid configuration',
        };
      }

      const filePath = await this.budgetPlannerService.generate(config);

      return {
        success: true,
        message: 'Budget planner generated successfully',
        filePath,
        productType: 'budget-planner',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating budget planner',
        error: error.message,
      };
    }
  }

  @Get('default-config')
  getDefaultConfig(): budgetPlannerConfigInterface.BudgetPlannerConfig {
    return this.budgetPlannerService.getDefaultConfig();
  }

  @Get('default-categories')
  getDefaultCategories() {
    return {
      incomeRows: this.budgetPlannerService.getDefaultIncomeRows(),
      expenseCategories: this.budgetPlannerService.getDefaultExpenseCategories(),
    };
  }
}
