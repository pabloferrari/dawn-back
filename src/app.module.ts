// backend/src/app.module.ts - Actualizar
import { Module } from '@nestjs/common';
import { BudgetPlannerModule } from './modules/products/budget-planner/budget-planner.module';
import { BabySignModule } from './modules/products/baby-sign/baby-sign.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BudgetPlannerModule,
    BabySignModule,
  ],
})
export class AppModule { }