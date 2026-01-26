// src/modules/products/athlete-cookbook/athlete-cookbook.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AthleteCookbookService } from './athlete-cookbook.service';
import * as athleteCookbookInterface from './interfaces/athlete-cookbook-config.interface';

@Controller('products/athlete-cookbook')
export class AthleteCookbookController {
  constructor(private readonly athleteCookbookService: AthleteCookbookService) {}

  @Post('generate')
  async generate(@Body() config: athleteCookbookInterface.AthleteCookbookConfig) {
    try {
      if (!this.athleteCookbookService.validateConfig(config)) {
        return {
          success: false,
          message: 'Invalid configuration',
        };
      }

      const filePath = await this.athleteCookbookService.generate(config);

      return {
        success: true,
        message: 'Athlete cookbook generated successfully',
        filePath,
        productType: 'athlete-cookbook',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating athlete cookbook',
        error: error.message,
      };
    }
  }

  @Get('default-config')
  getDefaultConfig(): Omit<athleteCookbookInterface.AthleteCookbookConfig, 'recipes'> & { recipes: [] } {
    return {
      productType: 'athlete-cookbook',
      year: 2026,
      coverTitle: 'Fuel Like a Runner',
      subtitle: "The Amateur Athlete's Cookbook",
      userName: '',
      language: 'en',
      athleteType: 'runner',
      theme: 'colorful',
      customization: {
        primaryColor: '#FF6B35',
        secondaryColor: '#2EC4B6',
        fontFamily: 'Lato',
      },
      recipes: [], // Recipes are loaded from JSON files based on language
      includeIntro: true,
      includeNutritionGuide: true,
      includeMealPlanner: true,
      includeShoppingList: true,
    };
  }

  @Get('categories')
  getCategories() {
    return {
      categories: athleteCookbookInterface.DEFAULT_CATEGORIES,
    };
  }

  @Get('recipe-count')
  getRecipeCount() {
    return this.athleteCookbookService.getRecipeCount();
  }
}
