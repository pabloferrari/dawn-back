// src/modules/products/baby-sign/baby-sign.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { BabySignService } from './baby-sign.service';
import * as babySignConfigInterface from './interfaces/baby-sign-config.interface';

@Controller('products/baby-sign')
export class BabySignController {
  constructor(private readonly babySignService: BabySignService) { }

  @Post('generate')
  async generate(@Body() config: babySignConfigInterface.BabySignConfig) {
    try {
      if (!this.babySignService.validateConfig(config)) {
        return {
          success: false,
          message: 'Invalid configuration',
        };
      }

      const filePath = await this.babySignService.generate(config);

      return {
        success: true,
        message: 'Baby sign guide generated successfully',
        filePath,
        productType: 'baby-sign',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating baby sign guide',
        error: error.message,
      };
    }
  }

  @Get('default-config')
  getDefaultConfig(): babySignConfigInterface.BabySignConfig {
    return {
      productType: 'baby-sign-guide',
      year: 2026,
      coverTitle: 'Baby Hands Talk',
      userName: '',
      language: 'en',
      theme: 'colorful',
      customization: {
        primaryColor: '#FF6B9D',
        secondaryColor: '#C44569',
        fontFamily: "'Nunito', sans-serif",
      },
      signs: this.babySignService.getDefaultSigns(),
      includeIntro: true,
      includePracticeLog: true,
    };
  }

  @Get('default-signs')
  getDefaultSigns() {
    return {
      signs: this.babySignService.getDefaultSigns(),
      totalSigns: this.babySignService.getDefaultSigns().length,
    };
  }
}