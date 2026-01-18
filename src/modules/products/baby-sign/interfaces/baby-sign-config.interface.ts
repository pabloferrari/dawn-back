// src/modules/products/baby-sign/interfaces/baby-sign-config.interface.ts
import { BaseProductConfig } from '../../../../common/interfaces/product-config.interface';

export interface BabySignConfig extends BaseProductConfig {
  productType: 'baby-sign-guide';
  signs: Array<SignItem>;
  includeIntro: boolean;
  includePracticeLog: boolean;
  categories?: CategoryConfig[];
}

export interface SignItem {
  word: string;
  category: 'food' | 'routine' | 'emotions' | 'animals' | 'family' | 'actions';
  howToSign: string;
  teachingTip: string;
  contextExample: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface CategoryConfig {
  name: string;
  color: string;
  icon?: string;
}