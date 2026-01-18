// src/modules/products/budget-planner/budget-planner.service.ts
import { Injectable } from '@nestjs/common';
import { PdfGeneratorService } from '../../pdf-generator/pdf-generator.service';
import { BudgetPlannerConfig } from './interfaces/budget-planner-config.interface';
import { ProductGenerator } from '../../../common/interfaces/product-config.interface';

@Injectable()
export class BudgetPlannerService implements ProductGenerator {
  private readonly PRODUCT_TYPE = 'budget-planner';

  constructor(private readonly pdfGeneratorService: PdfGeneratorService) { }

  async generate(config: BudgetPlannerConfig): Promise<string> {
    const browser = await this.pdfGeneratorService.launchBrowser();

    try {
      const pdfBuffers: Buffer[] = [];

      // 1. Cover
      console.log('Generando portada...');
      const coverBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'cover',
        config,
      );
      pdfBuffers.push(coverBuffer);

      // 2. How to Use Guide (NUEVA PÁGINA)
      console.log('Generando guía de uso...');
      const guideBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'how-to-use',
        config,
      );
      pdfBuffers.push(guideBuffer);

      // 3. Monthly budgets
      if (config.sections.monthlyBudget) {
        console.log('Generando presupuestos mensuales...');
        for (let month = 0; month < 12; month++) {
          const monthBuffer = await this.generateMonthlyBudget(
            browser,
            config,
            month,
          );
          pdfBuffers.push(monthBuffer);
        }
      }

      // 4. Expense trackers
      if (config.sections.expenseTracker) {
        console.log('Generando expense trackers...');
        for (let month = 0; month < 12; month++) {
          const trackerBuffer = await this.generateExpenseTracker(
            browser,
            config,
            month,
          );
          pdfBuffers.push(trackerBuffer);
        }
      }

      // 5. Savings goals
      if (config.sections.savingsGoals) {
        console.log('Generando savings goals...');
        const goalsBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'savings-goal',
          config,
        );
        pdfBuffers.push(goalsBuffer);
      }

      // 6. Debt payoff (si existe)
      if (config.sections.debtPayoff) {
        console.log('Generando debt payoff...');
        const debtBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'debt-payoff',
          config,
        );
        pdfBuffers.push(debtBuffer);
      }

      // 7. Yearly overview
      if (config.sections.yearlyOverview) {
        console.log('Generando yearly overview...');
        const overviewBuffer = await this.generateYearlyOverview(
          browser,
          config,
        );
        pdfBuffers.push(overviewBuffer);
      }

      // 8. Merge PDFs
      console.log('Combinando PDFs...');
      const finalPdf = await this.pdfGeneratorService.mergePdfs(pdfBuffers);

      // 9. Save
      const fileName = `budget-planner-${config.year}-${Date.now()}.pdf`;
      const outputPath = await this.pdfGeneratorService.savePdf(
        finalPdf,
        this.PRODUCT_TYPE,
        fileName,
      );

      await browser.close();
      return outputPath;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  validateConfig(config: BudgetPlannerConfig): boolean {
    return !!(
      config.year &&
      config.coverTitle &&
      config.customization &&
      config.sections
    );
  }

  getDefaultConfig(): BudgetPlannerConfig {
    return {
      productType: 'budget-planner',
      year: 2026,
      coverTitle: 'Budget Planner',
      userName: '',
      theme: 'professional',
      sections: {
        monthlyBudget: true,
        expenseTracker: true,
        savingsGoals: true,
        debtPayoff: false,
        yearlyOverview: true,
      },
      customization: {
        primaryColor: '#2C3E50',
        secondaryColor: '#3498DB',
        fontFamily: "'Arial', sans-serif",
      },
      goals: [
        { name: 'Emergency Fund', targetAmount: '10000' },
        { name: 'Vacation', targetAmount: '3000' },
        { name: 'New Car', targetAmount: '15000' },
      ],
    };
  }

  getDefaultIncomeRows() {
    return [
      { label: 'Salary' },
      { label: 'Freelance' },
      { label: 'Investments' },
      { label: 'Other' },
    ];
  }

  getDefaultExpenseCategories() {
    return [
      { label: 'Housing' },
      { label: 'Transportation' },
      { label: 'Food & Groceries' },
      { label: 'Utilities' },
      { label: 'Healthcare' },
      { label: 'Entertainment' },
      { label: 'Subscriptions' },
      { label: 'Debt Payments' },
      { label: 'Savings' },
      { label: 'Other' },
    ];
  }

  private async generateMonthlyBudget(
    browser: any,
    config: BudgetPlannerConfig,
    monthIndex: number,
  ): Promise<Buffer> {
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];

    const data = {
      ...config,
      currentMonth: monthNames[monthIndex],
      incomeRows: config.incomeRows || this.getDefaultIncomeRows(),
      expenseCategories:
        config.expenseCategories || this.getDefaultExpenseCategories(),
    };

    return this.pdfGeneratorService.generatePage(
      browser,
      this.PRODUCT_TYPE,
      'monthly-budget',
      data,
    );
  }

  private async generateExpenseTracker(
    browser: any,
    config: BudgetPlannerConfig,
    monthIndex: number,
  ): Promise<Buffer> {
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];

    const data = {
      ...config,
      currentMonth: monthNames[monthIndex],
    };

    return this.pdfGeneratorService.generatePage(
      browser,
      this.PRODUCT_TYPE,
      'expense-tracker',
      data,
    );
  }

  private async generateYearlyOverview(
    browser: any,
    config: BudgetPlannerConfig,
  ): Promise<Buffer> {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const data = {
      ...config,
      months,
    };

    return this.pdfGeneratorService.generatePage(
      browser,
      this.PRODUCT_TYPE,
      'yearly-overview',
      data,
    );
  }
}