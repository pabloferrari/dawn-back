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

      // 2. "This Planner Is For You If..." (NUEVO - Fase 2)
      console.log('Generando página "For You If"...');
      const forYouIfBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'for-you-if',
        config,
      );
      pdfBuffers.push(forYouIfBuffer);

      // 2.5 Quick Start - Your First 7 Days (NUEVO)
      console.log('Generando página Quick Start...');
      const quickStartBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'quick-start',
        config,
      );
      pdfBuffers.push(quickStartBuffer);

      // 3. Your Financial Starting Point (NUEVO - Fase 2)
      console.log('Generando punto de partida financiero...');
      const startingPointBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'starting-point',
        config,
      );
      pdfBuffers.push(startingPointBuffer);

      // 4. Your 3 Financial Goals (NUEVO - Fase 2)
      console.log('Generando metas financieras...');
      const financialGoalsBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'financial-goals',
        config,
      );
      pdfBuffers.push(financialGoalsBuffer);

      // 5. Mini Budget Guide (NUEVO - Fase 2)
      console.log('Generando guía de presupuesto...');
      const budgetGuideBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'budget-guide',
        config,
      );
      pdfBuffers.push(budgetGuideBuffer);

      // 6. Mini Debt Payoff Guide (NUEVO - Fase 2)
      console.log('Generando guía de pago de deudas...');
      const debtGuideBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'debt-guide',
        config,
      );
      pdfBuffers.push(debtGuideBuffer);

      // 7. How to Use This Planner
      console.log('Generando guía de uso...');
      const guideBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'how-to-use',
        config,
      );
      pdfBuffers.push(guideBuffer);

      // 8. Subscriptions Tracker (NUEVO - Fase 4)
      console.log('Generando tracker de suscripciones...');
      const subscriptionsBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'subscriptions',
        config,
      );
      pdfBuffers.push(subscriptionsBuffer);

      // 9. Net Worth Tracker (NUEVO - Fase 4)
      console.log('Generando tracker de patrimonio neto...');
      const netWorthBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'net-worth',
        config,
      );
      pdfBuffers.push(netWorthBuffer);

      // 10. Year at a Glance
      if (config.sections.yearlyOverview) {
        console.log('Generando yearly overview...');
        const overviewBuffer = await this.generateYearlyOverview(
          browser,
          config,
        );
        pdfBuffers.push(overviewBuffer);
      }

      // 11. Monthly budgets (12 meses)
      if (config.sections.monthlyBudget) {
        console.log('Generando presupuestos mensuales...');
        for (let month = 0; month < 12; month++) {
          const monthBuffer = await this.generateMonthlyBudget(
            browser,
            config,
            month,
          );
          pdfBuffers.push(monthBuffer);

          // Expense tracker después de cada mes
          if (config.sections.expenseTracker) {
            const trackerBuffer = await this.generateExpenseTracker(
              browser,
              config,
              month,
            );
            pdfBuffers.push(trackerBuffer);
          }
        }
      }

      // 12. Savings goals
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

      // 13. Debt payoff tracker
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

      // 14. Your Next Year Money Plan (página final)
      console.log('Generando plan del próximo año...');
      const nextYearPlanBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'next-year-plan',
        { ...config, nextYear: config.year + 1 },
      );
      pdfBuffers.push(nextYearPlanBuffer);

      // 15. Merge PDFs
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
      language: 'en',
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

    const monthlyTips = this.getMonthlyTips();

    const data = {
      ...config,
      currentMonth: monthNames[monthIndex],
      incomeRows: config.incomeRows || this.getDefaultIncomeRows(),
      expenseCategories:
        config.expenseCategories || this.getDefaultExpenseCategories(),
      monthTip: monthlyTips[monthIndex],
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
      nextYear: config.year + 1,
    };

    return this.pdfGeneratorService.generatePage(
      browser,
      this.PRODUCT_TYPE,
      'yearly-overview',
      data,
    );
  }

  getMonthlyTips(): string[] {
    return [
      "Tip: Review post-holiday spending and reset your budget for the new year.",
      "Tip: February is a great month to audit your subscriptions — cancel what you don't use!",
      "Tip: Spring cleaning? Apply it to your finances too. Review and declutter your expenses.",
      "Tip: Tax season reminder — set aside money for any taxes owed or plan how to use your refund wisely.",
      "Tip: Mid-year check! Are you on track with your savings goals? Adjust if needed.",
      "Tip: Summer activities can add up. Plan ahead for vacations and events.",
      "Tip: Back-to-school expenses coming? Start budgeting now for supplies and activities.",
      "Tip: Review your insurance policies — are you getting the best rates?",
      "Tip: Fall is a great time to boost your emergency fund before the holidays.",
      "Tip: Start thinking about holiday gifts now. A little planning prevents December stress.",
      "Tip: Black Friday deals can be traps. Stick to your list and budget!",
      "Tip: Year-end reflection time. Review your progress and celebrate your wins!",
    ];
  }
}