// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { BudgetPlannerModule } from './modules/products/budget-planner/budget-planner.module';
import { BabySignModule } from './modules/products/baby-sign/baby-sign.module';
import { AthleteCookbookModule } from './modules/products/athlete-cookbook/athlete-cookbook.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BudgetPlannerModule,
    BabySignModule,
    AthleteCookbookModule,
  ],
})
export class AppModule {}