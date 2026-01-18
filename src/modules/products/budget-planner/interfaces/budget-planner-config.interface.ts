// src/modules/products/budget-planner/interfaces/budget-planner-config.interface.ts
import { BaseProductConfig } from '../../../../common/interfaces/product-config.interface';

export interface BudgetPlannerConfig extends BaseProductConfig {
  productType: 'budget-planner';
  sections: {
    monthlyBudget: boolean;
    expenseTracker: boolean;
    savingsGoals: boolean;
    debtPayoff: boolean;
    yearlyOverview: boolean;
  };
  incomeRows?: Array<{ label: string }>;
  expenseCategories?: Array<{ label: string }>;
  goals?: Array<{ name: string; targetAmount: string }>;
}