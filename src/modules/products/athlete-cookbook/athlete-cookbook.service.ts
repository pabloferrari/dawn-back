// src/modules/products/athlete-cookbook/athlete-cookbook.service.ts
import { Injectable } from '@nestjs/common';
import { PdfGeneratorService } from '../../pdf-generator/pdf-generator.service';
import {
  AthleteCookbookConfig,
  Recipe,
  RecipeCategory,
  DEFAULT_CATEGORIES,
} from './interfaces/athlete-cookbook-config.interface';
import { ProductGenerator } from '../../../common/interfaces/product-config.interface';
import * as fs from 'fs';
import * as path from 'path';

// Helper to convert image to base64 data URL
function imageToBase64(imagePath: string): string {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase().slice(1);
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error loading image: ${imagePath}`, error.message);
    return '';
  }
}

// Nutrition info for enriched recipes
interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

// Timing info for enriched recipes
interface TimingInfo {
  bestConsumed: string;
  digestionTime: number; // minutes
  idealFor: string[];
}

// Training phases
type TrainingPhase = 'base' | 'build' | 'peak' | 'recovery';

// Types for recipe data files
interface RecipeData {
  id: string;
  title: string;
  ingredients: string[];
  preparation: string[];
  notes: string[];
  category: string;
  tags: string[];
  // Enriched fields (optional for backwards compatibility)
  nutrition?: NutritionInfo;
  timing?: TimingInfo;
  trainingPhase?: TrainingPhase[];
  prepTime?: number;
  servings?: number;
  // Personal touch - coach notes from personal experience
  coachNote?: string;
}

// Types for translations
interface Translations {
  en: TranslationSet;
  es: TranslationSet;
}

interface TranslationSet {
  product: { title: string; subtitle: string };
  cover: Record<string, unknown>;
  sections: Record<string, Record<string, unknown>>;
  categories: Record<string, CategoryTranslation>;
  tags: Record<string, string>;
  timing: Record<string, string>;
  hydration: Record<string, string>;
  principles: Record<string, { title: string; description: string }>;
  days: Record<string, string>;
  meals: Record<string, string>;
  recoveryFoods: Record<string, { name: string; benefit: string }>;
}

interface CategoryTranslation {
  name: string;
  description: string;
  tip: string;
  tipLabel: string;
}

// Types for shopping list data
interface ShoppingListData {
  language: string;
  total_items: number;
  items: ShoppingItem[];
}

interface ShoppingItem {
  item: string;
  recipe_count: number;
  recipes: string[];
}

@Injectable()
export class AthleteCookbookService implements ProductGenerator {
  private readonly PRODUCT_TYPE = 'athlete-cookbook';
  private readonly dataPath = path.join(
    process.cwd(),
    'src/modules/products/athlete-cookbook/data',
  );
  private recipesEn: RecipeData[] = [];
  private recipesEs: RecipeData[] = [];
  private translations: Translations;
  private shoppingListEn: ShoppingListData | null = null;
  private shoppingListEs: ShoppingListData | null = null;

  constructor(private readonly pdfGeneratorService: PdfGeneratorService) {
    this.loadData();
  }

  private loadData(): void {
    try {
      console.log(`[AthleteCookbook] Loading data from: ${this.dataPath}`);
      // Load recipes - prefer enriched version if available
      const enEnrichedPath = path.join(this.dataPath, 'fuel_like_a_runner-en-enriched.json');
      const enPath = path.join(this.dataPath, 'fuel_like_a_runner-en.json');
      const esEnrichedPath = path.join(this.dataPath, 'fuel_like_a_runner-es-enriched.json');
      const esPath = path.join(this.dataPath, 'fuel_like_a_runner-es.json');
      const translationsPath = path.join(this.dataPath, 'translations.json');

      // English: use enriched if available, fallback to original
      if (fs.existsSync(enEnrichedPath)) {
        this.recipesEn = JSON.parse(fs.readFileSync(enEnrichedPath, 'utf8'));
        console.log(`Loaded ${this.recipesEn.length} English recipes (enriched with nutrition data)`);
      } else if (fs.existsSync(enPath)) {
        this.recipesEn = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        console.log(`Loaded ${this.recipesEn.length} English recipes (basic)`);
      }

      // Spanish: use enriched if available, fallback to original
      if (fs.existsSync(esEnrichedPath)) {
        this.recipesEs = JSON.parse(fs.readFileSync(esEnrichedPath, 'utf8'));
        console.log(`Loaded ${this.recipesEs.length} Spanish recipes (enriched with nutrition data)`);
      } else if (fs.existsSync(esPath)) {
        this.recipesEs = JSON.parse(fs.readFileSync(esPath, 'utf8'));
        console.log(`Loaded ${this.recipesEs.length} Spanish recipes (basic)`);
      }

      if (fs.existsSync(translationsPath)) {
        this.translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
        console.log('Loaded translations');
      }

      // Load shopping lists
      const shoppingListEnPath = path.join(this.dataPath, 'shopping_list_en.json');
      const shoppingListEsPath = path.join(this.dataPath, 'shopping_list_es.json');

      if (fs.existsSync(shoppingListEnPath)) {
        this.shoppingListEn = JSON.parse(fs.readFileSync(shoppingListEnPath, 'utf8'));
        console.log(`Loaded ${this.shoppingListEn?.total_items} English shopping list items`);
      }

      if (fs.existsSync(shoppingListEsPath)) {
        this.shoppingListEs = JSON.parse(fs.readFileSync(shoppingListEsPath, 'utf8'));
        console.log(`Loaded ${this.shoppingListEs?.total_items} Spanish shopping list items`);
      }
    } catch (error) {
      console.error('Error loading athlete cookbook data:', error);
    }
  }

  getRecipes(language: 'en' | 'es' = 'en'): RecipeData[] {
    return language === 'es' ? this.recipesEs : this.recipesEn;
  }

  getTranslations(language: 'en' | 'es' = 'en'): TranslationSet {
    return this.translations?.[language] || this.translations?.en;
  }

  getRecipeCount(): { en: number; es: number } {
    return {
      en: this.recipesEn.length,
      es: this.recipesEs.length,
    };
  }

  async generate(config: AthleteCookbookConfig): Promise<string> {
    const browser = await this.pdfGeneratorService.launchBrowser();

    // Load images as base64 for templates
    const assetsPath = path.join(process.cwd(), 'assets/athlete-cookbook');
    const logoBase64 = imageToBase64(path.join(assetsPath, 'fuel-like-a-runner-logo.png'));
    const bannerBase64 = imageToBase64(path.join(assetsPath, 'fuel-like-a-runner-banner.png'));

    const configWithAssets = {
      ...config,
      assetsPath,
      images: {
        logo: logoBase64,
        banner: bannerBase64,
      },
    };

    try {
      const pdfBuffers: Buffer[] = [];

      // 1. Cover page
      console.log('Generating cover...');
      const coverBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'cover',
        configWithAssets,
      );
      pdfBuffers.push(coverBuffer);

      // 1b. Disclaimer page (always included for legal protection)
      console.log('Generating disclaimer...');
      const disclaimerBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'disclaimer',
        configWithAssets,
      );
      pdfBuffers.push(disclaimerBuffer);

      // 2. Introduction pages
      if (config.includeIntro) {
        console.log('Generating introduction...');

        // Philosophy page - fresh ingredients focus
        const philosophyBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'intro-philosophy',
          configWithAssets,
        );
        pdfBuffers.push(philosophyBuffer);

        // How to use this book
        const howToBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'intro-how-to-use',
          configWithAssets,
        );
        pdfBuffers.push(howToBuffer);
      }

      // 3. Nutrition guide
      if (config.includeNutritionGuide) {
        console.log('Generating nutrition guide...');
        const nutritionBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'nutrition-guide',
          configWithAssets,
        );
        pdfBuffers.push(nutritionBuffer);

        // 3b. Quick Reference Card
        console.log('Generating quick reference card...');
        const quickRefBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'quick-reference',
          configWithAssets,
        );
        pdfBuffers.push(quickRefBuffer);

        // 3c. Troubleshooting Guide
        console.log('Generating troubleshooting guide...');
        const troubleshootingBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'troubleshooting',
          configWithAssets,
        );
        pdfBuffers.push(troubleshootingBuffer);

        // 3d. Goals Guide - How to use this book by goal
        console.log('Generating goals guide...');
        const goalsGuideBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'goals-guide',
          configWithAssets,
        );
        pdfBuffers.push(goalsGuideBuffer);
      }

      // 4. Table of contents / Category index
      console.log('Generating table of contents...');
      const indexData = {
        ...this.generateCategoryIndex(config),
        assetsPath,
      };
      const indexBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'category-index',
        indexData,
      );
      pdfBuffers.push(indexBuffer);

      // 5. Recipe pages - 3 recipes per page, organized by category
      console.log('Generating recipe pages...');

      // Get recipes organized by category
      const recipesByCategory = this.getRecipesByCategory(config.language as 'en' | 'es');
      const categoryOrder = this.getCategoryOrder();

      // Flatten recipes in category order
      const orderedRecipes: RecipeData[] = [];
      for (const category of categoryOrder) {
        if (recipesByCategory[category]) {
          orderedRecipes.push(...recipesByCategory[category]);
        }
      }
      // Add any remaining categories not in the order
      for (const [category, recipes] of Object.entries(recipesByCategory)) {
        if (!categoryOrder.includes(category)) {
          orderedRecipes.push(...recipes);
        }
      }

      console.log(`[Recipes] Total valid recipes: ${orderedRecipes.length}`);

      // Group recipes into chunks of 3
      const RECIPES_PER_PAGE = 3;
      const recipeChunks: RecipeData[][] = [];
      for (let i = 0; i < orderedRecipes.length; i += RECIPES_PER_PAGE) {
        recipeChunks.push(orderedRecipes.slice(i, i + RECIPES_PER_PAGE));
      }

      console.log(`[Recipes] Generating ${recipeChunks.length} pages...`);

      // Generate multi-recipe pages
      for (const recipeGroup of recipeChunks) {
        const pageData = {
          ...configWithAssets,
          recipes: recipeGroup,
        };
        const recipeBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'recipe-page-multi',
          pageData,
        );
        pdfBuffers.push(recipeBuffer);
      }

      // 6. Meal planner templates
      if (config.includeMealPlanner) {
        console.log('Generating meal planner...');
        const plannerBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'meal-planner',
          configWithAssets,
        );
        pdfBuffers.push(plannerBuffer);
      }

      // 7. Shopping list (if enabled)
      if (config.includeShoppingList) {
        console.log('Generating shopping list...');
        const shoppingData = {
          ...this.generateShoppingList(config),
          assetsPath,
        };
        const shoppingBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'shopping-list',
          shoppingData,
        );
        pdfBuffers.push(shoppingBuffer);
      }

      // 8. Merge all PDFs
      console.log('Merging PDFs...');
      const finalPdf = await this.pdfGeneratorService.mergePdfs(pdfBuffers);

      // 9. Save
      const fileName = `athlete-cookbook-${Date.now()}.pdf`;
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

  validateConfig(config: AthleteCookbookConfig): boolean {
    // Note: recipes from config.recipes are ignored - we load from JSON files
    // So we don't validate recipes.length anymore
    return !!(
      config.year &&
      config.coverTitle &&
      config.customization
    );
  }

  private groupRecipesByCategory(recipes: Recipe[]): Record<string, Recipe[]> {
    // Define category order - matches cookbook flow
    const categoryOrder: RecipeCategory[] = [
      'breakfast',
      'lunch',
      'dinner',
      'snacks',
      'energy-bars',
      'pre-race',
      'post-workout',
      'pre-workout',
      'post-race',
      'hydration',
      'base',
      'info',
    ];

    const grouped = recipes.reduce(
      (acc, recipe) => {
        if (!acc[recipe.category]) {
          acc[recipe.category] = [];
        }
        acc[recipe.category].push(recipe);
        return acc;
      },
      {} as Record<string, Recipe[]>,
    );

    // Sort by category order
    const sorted: Record<string, Recipe[]> = {};
    for (const category of categoryOrder) {
      if (grouped[category]) {
        sorted[category] = grouped[category];
      }
    }

    return sorted;
  }

  private generateCategoryIndex(config: AthleteCookbookConfig) {
    // Use recipes from JSON, organized by category
    const recipesByCategory = this.getRecipesByCategory(config.language as 'en' | 'es');
    const categoryOrder = this.getCategoryOrder();

    // Minimum recipes to have its own category card
    const MIN_RECIPES_FOR_CATEGORY = 3;

    // Build categories array in order (only categories with enough recipes)
    const categories: Array<{
      id: string;
      name: string;
      description: string;
      color: string;
      icon: string;
      count: number;
      recipes: string[];
    }> = [];

    // Special purpose recipes (from small categories)
    const specialRecipes: Array<{
      title: string;
      category: string;
      categoryName: string;
      color: string;
    }> = [];

    let totalRecipes = 0;

    // Category display names for badges
    const categoryBadgeNames: Record<string, string> = {
      'pre-race': 'PRE-RACE',
      'post-workout': 'POST-WORKOUT',
      'hydration': 'HYDRATION',
      'info': 'INFO',
    };

    // Category colors for badges
    const categoryBadgeColors: Record<string, string> = {
      'pre-race': '#F9A825',
      'post-workout': '#00897B',
      'hydration': '#1976D2',
      'info': '#78909C',
    };

    for (const categoryId of categoryOrder) {
      const recipes = recipesByCategory[categoryId];
      if (recipes && recipes.length > 0) {
        totalRecipes += recipes.length;

        if (recipes.length >= MIN_RECIPES_FOR_CATEGORY) {
          // Regular category card
          const categoryConfig = this.getCategoryConfig(categoryId as RecipeCategory);
          categories.push({
            ...categoryConfig,
            count: recipes.length,
            recipes: recipes.map((r) => r.title),
          });
        } else {
          // Add to special recipes with badge
          for (const recipe of recipes) {
            specialRecipes.push({
              title: recipe.title,
              category: categoryId,
              categoryName: categoryBadgeNames[categoryId] || categoryId.toUpperCase(),
              color: categoryBadgeColors[categoryId] || '#666',
            });
          }
        }
      }
    }

    return {
      ...config,
      categories,
      specialRecipes,
      hasSpecialRecipes: specialRecipes.length > 0,
      totalRecipes,
      totalCategories: categories.length,
    };
  }

  private getCategoryConfig(category: RecipeCategory) {
    return (
      DEFAULT_CATEGORIES.find((c) => c.id === category) || {
        id: category,
        name: category,
        description: '',
        color: '#666666',
        icon: '🍽️',
      }
    );
  }

  private generateShoppingList(config: AthleteCookbookConfig) {
    // Use pre-generated shopping list data from JSON files
    const language = config.language || 'en';
    const shoppingData = language === 'es' ? this.shoppingListEs : this.shoppingListEn;

    if (!shoppingData) {
      // Fallback to empty list if data not loaded
      return {
        ...config,
        shoppingItems: [],
        totalItems: 0,
      };
    }

    // Get top items (most frequently used across recipes)
    // Limit to reasonable number for display (e.g., top 60 items)
    const topItems = shoppingData.items
      .slice(0, 60)
      .map(item => ({
        name: item.item.replace(/,\s*$/, '').trim(), // Clean trailing commas
        recipeCount: item.recipe_count,
      }));

    return {
      ...config,
      shoppingItems: topItems,
      totalItems: shoppingData.total_items,
    };
  }

  // Get recipes organized by category
  getRecipesByCategory(language: 'en' | 'es' = 'en'): Record<string, RecipeData[]> {
    const recipes = language === 'es' ? this.recipesEs : this.recipesEn;
    const validRecipes = recipes.filter((r) => r.ingredients && r.ingredients.length > 0);

    const grouped: Record<string, RecipeData[]> = {};
    for (const recipe of validRecipes) {
      const category = recipe.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(recipe);
    }

    return grouped;
  }

  // Get category order for display
  getCategoryOrder(): string[] {
    return [
      'breakfast',
      'lunch',
      'dinner',
      'snacks',
      'energy-bars',
      'pre-race',
      'post-workout',
      'hydration',
      'base',
    ];
  }

  // Get recipes organized by training phase
  getRecipesByTrainingPhase(language: 'en' | 'es' = 'en'): Record<TrainingPhase, RecipeData[]> {
    const recipes = language === 'es' ? this.recipesEs : this.recipesEn;
    const validRecipes = recipes.filter((r) => r.ingredients && r.ingredients.length > 0);

    const grouped: Record<TrainingPhase, RecipeData[]> = {
      base: [],
      build: [],
      peak: [],
      recovery: [],
    };

    for (const recipe of validRecipes) {
      if (recipe.trainingPhase && recipe.trainingPhase.length > 0) {
        for (const phase of recipe.trainingPhase) {
          grouped[phase].push(recipe);
        }
      } else {
        // Default to base phase if not specified
        grouped.base.push(recipe);
      }
    }

    return grouped;
  }

  // Get nutrition summary stats for all recipes
  getNutritionStats(language: 'en' | 'es' = 'en'): {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    recipesWithNutrition: number;
    totalRecipes: number;
  } {
    const recipes = language === 'es' ? this.recipesEs : this.recipesEn;
    const withNutrition = recipes.filter((r) => r.nutrition);

    if (withNutrition.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        recipesWithNutrition: 0,
        totalRecipes: recipes.length,
      };
    }

    const totals = withNutrition.reduce(
      (acc, r) => ({
        calories: acc.calories + (r.nutrition?.calories || 0),
        protein: acc.protein + (r.nutrition?.protein || 0),
        carbs: acc.carbs + (r.nutrition?.carbs || 0),
        fat: acc.fat + (r.nutrition?.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const count = withNutrition.length;
    return {
      avgCalories: Math.round(totals.calories / count),
      avgProtein: Math.round(totals.protein / count),
      avgCarbs: Math.round(totals.carbs / count),
      avgFat: Math.round(totals.fat / count),
      recipesWithNutrition: count,
      totalRecipes: recipes.length,
    };
  }
}
