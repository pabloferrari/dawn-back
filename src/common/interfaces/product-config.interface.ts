// src/common/interfaces/product-config.interface.ts
export interface BaseProductConfig {
  productType: string;
  year: number;
  coverTitle: string;
  userName?: string;
  theme: 'minimal' | 'colorful' | 'professional';
  customization: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export interface ProductGenerator {
  generate(config: any): Promise<string>;
  validateConfig(config: any): boolean;
}