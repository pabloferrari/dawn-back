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
  // New favorite system fields
  tier?: 'favorite' | 'standard';
  sortOrder?: number | null;
  whyFavorite?: string | null;
  prepComplexity?: 'simple' | 'moderate' | 'complex';
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
      // Load recipes - use new updated files with favorites system
      const enUpdatedPath = path.join(this.dataPath, 'en_updated.json');
      const esUpdatedPath = path.join(this.dataPath, 'es.json');
      const translationsPath = path.join(this.dataPath, 'translations.json');

      // English: use updated file with favorites
      if (fs.existsSync(enUpdatedPath)) {
        this.recipesEn = JSON.parse(fs.readFileSync(enUpdatedPath, 'utf8'));
        const favorites = this.recipesEn.filter(r => r.tier === 'favorite');
        console.log(`Loaded ${this.recipesEn.length} English recipes (${favorites.length} favorites)`);
      }

      // Spanish: use updated file with favorites
      if (fs.existsSync(esUpdatedPath)) {
        this.recipesEs = JSON.parse(fs.readFileSync(esUpdatedPath, 'utf8'));
        const favorites = this.recipesEs.filter(r => r.tier === 'favorite');
        console.log(`Loaded ${this.recipesEs.length} Spanish recipes (${favorites.length} favorites)`);
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

    // Page counter for pagination
    let currentPage = 1;

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

      // Helper to add page with pagination
      const addPage = async (template: string, data: Record<string, unknown> = {}) => {
        const pageData = { ...configWithAssets, ...data, pageNumber: currentPage };
        const buffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          template,
          pageData,
        );
        pdfBuffers.push(buffer);
        currentPage++;
        return buffer;
      };

      const language = (config.language || 'en') as 'en' | 'es';
      const isSpanish = language === 'es';

      // 1. Cover page (no page number)
      console.log('Generating cover...');
      const coverBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'cover',
        configWithAssets,
      );
      pdfBuffers.push(coverBuffer);

      // 2. My Story / Why I wrote this book
      console.log('Generating intro story...');
      await addPage('intro-story');

      // 3. Mistakes I Made
      console.log('Generating mistakes page...');
      await addPage('intro-mistakes');

      // 4. Disclaimer page
      console.log('Generating disclaimer...');
      await addPage('disclaimer');

      // 4. Introduction pages (Philosophy + How to Use)
      if (config.includeIntro) {
        console.log('Generating introduction...');
        await addPage('intro-philosophy');
        await addPage('intro-how-to-use');
      }

      // 5. Nutrition guide (4 pages)
      if (config.includeNutritionGuide) {
        console.log('Generating nutrition guide...');
        await addPage('nutrition-guide');
        await addPage('quick-reference');
        await addPage('troubleshooting');
        await addPage('goals-guide');
      }

      // 6. MY FAVORITES - 4 pages with full recipe details (one per meal)
      console.log('Generating favorites section (4 pages with full recipes)...');
      const favorites = this.getFavoritesByMeal(language);

      const mealConfigs = [
        {
          id: 'breakfast',
          name: isSpanish ? 'Desayuno' : 'Breakfast',
          icon: '🌅',
          color: '#FF8F00',
          recipes: favorites.breakfast.slice(0, 3) // Max 3 per page
        },
        {
          id: 'lunch',
          name: isSpanish ? 'Almuerzo' : 'Lunch',
          icon: '☀️',
          color: '#43A047',
          recipes: favorites.lunch.slice(0, 3)
        },
        {
          id: 'snacks',
          name: isSpanish ? 'Merienda' : 'Snacks',
          icon: '🍎',
          color: '#EF6C00',
          recipes: favorites.snacks.slice(0, 3)
        },
        {
          id: 'dinner',
          name: isSpanish ? 'Cena' : 'Dinner',
          icon: '🌙',
          color: '#7E57C2',
          recipes: favorites.dinner.slice(0, 3)
        },
      ];

      for (let i = 0; i < mealConfigs.length; i++) {
        const meal = mealConfigs[i];
        if (meal.recipes.length > 0) {
          await addPage('favorites-meal-page', {
            meal,
            isFirstFavoritesPage: i === 0,
            favoritesPageIndex: i + 1,
            totalFavoritesPages: mealConfigs.length,
            section: {
              title: isSpanish ? 'Mis Favoritos' : 'My Favorites',
              intro: isSpanish
                ? 'Las recetas que realmente uso. Representan el 90% de lo que como.'
                : 'The recipes I actually use. They represent 90% of what I eat.',
            }
          });
        }
      }

      // 7. Table of contents / Category index (for "Other Recipes")
      console.log('Generating recipe index...');
      const indexData = this.generateCategoryIndex(config);
      await addPage('category-index', indexData);

      // 6. Recipe pages - 3 recipes per page, organized by category
      console.log('Generating recipe pages...');

      // Get recipes organized by category
      const recipesByCategory = this.getRecipesByCategory(language);
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

      // TESTING: Limit to 15 recipes for faster PDF generation
      const TEST_RECIPE_LIMIT = 15;
      const limitedRecipes = orderedRecipes.slice(0, TEST_RECIPE_LIMIT);
      console.log(`[Recipes] Total valid recipes: ${orderedRecipes.length}, using ${limitedRecipes.length} for testing`);

      // Group recipes into chunks of 3
      const RECIPES_PER_PAGE = 3;
      const recipeChunks: RecipeData[][] = [];
      for (let i = 0; i < limitedRecipes.length; i += RECIPES_PER_PAGE) {
        recipeChunks.push(limitedRecipes.slice(i, i + RECIPES_PER_PAGE));
      }

      console.log(`[Recipes] Generating ${recipeChunks.length} pages...`);

      // Generate multi-recipe pages with pagination
      for (const recipeGroup of recipeChunks) {
        await addPage('recipe-page-multi', { recipes: recipeGroup });
      }

      // 7. Meal planner templates
      if (config.includeMealPlanner) {
        console.log('Generating meal planner...');
        await addPage('meal-planner');
      }

      // 8. Shopping list (if enabled)
      if (config.includeShoppingList) {
        console.log('Generating shopping list...');
        const shoppingData = this.generateShoppingList(config);
        await addPage('shopping-list', shoppingData);
      }

      console.log(`[PDF] Total pages: ${currentPage - 1}`);

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

    // Category display names for badges (keep short to avoid line breaks)
    const categoryBadgeNames: Record<string, string> = {
      'pre-race': 'PRE-RACE',
      'post-workout': 'RECOVERY',
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

  private generateFavoritesSection(config: AthleteCookbookConfig) {
    const language = (config.language || 'en') as 'en' | 'es';
    const favorites = this.getFavoritesByMeal(language);

    const isSpanish = language === 'es';

    const section = {
      icon: '⭐',
      title: isSpanish ? 'Mis Favoritos' : 'My Favorites',
      intro: isSpanish
        ? 'Estas son las recetas que realmente uso. Las roto durante la semana para no aburrirme, y representan el 90% de lo que como. Si no sabés por dónde empezar, empezá por acá.'
        : 'These are the recipes I actually use. I rotate them throughout the week to keep things interesting, and they represent 90% of what I eat. If you don\'t know where to start, start here.',
      footer: isSpanish
        ? 'Cada receta incluye por qué me gusta y su nivel de complejidad'
        : 'Each recipe includes why I like it and its complexity level',
    };

    const meals = [
      {
        id: 'breakfast',
        name: isSpanish ? 'Desayuno' : 'Breakfast',
        icon: '🌅',
        recipes: favorites.breakfast,
        emptyIcon: '🍳',
        emptyText: isSpanish ? 'Próximamente...' : 'Coming soon...',
      },
      {
        id: 'lunch',
        name: isSpanish ? 'Almuerzo' : 'Lunch',
        icon: '☀️',
        recipes: favorites.lunch,
        emptyIcon: '🥗',
        emptyText: isSpanish ? 'Próximamente...' : 'Coming soon...',
      },
      {
        id: 'snack',
        name: isSpanish ? 'Merienda' : 'Snacks',
        icon: '🍎',
        recipes: favorites.snacks,
        emptyIcon: '🥜',
        emptyText: isSpanish ? 'Próximamente...' : 'Coming soon...',
      },
      {
        id: 'dinner',
        name: isSpanish ? 'Cena' : 'Dinner',
        icon: '🌙',
        recipes: favorites.dinner,
        emptyIcon: '🍽️',
        emptyText: isSpanish ? 'Próximamente...' : 'Coming soon...',
      },
    ];

    return { section, meals };
  }

  private generateShoppingList(config: AthleteCookbookConfig) {
    // Use pre-generated shopping list data from JSON files
    const language = config.language || 'en';
    const shoppingData = language === 'es' ? this.shoppingListEs : this.shoppingListEn;

    if (!shoppingData) {
      // Fallback to empty list if data not loaded
      return {
        ...config,
        shoppingCategories: [],
        totalItems: 0,
      };
    }

    // Category definitions with keywords for matching
    const categoryDefs = [
      {
        id: 'vegetables',
        name: language === 'es' ? 'Verduras' : 'Vegetables',
        icon: '🥬',
        keywords: ['onion', 'tomato', 'pepper', 'carrot', 'lettuce', 'spinach', 'broccoli', 'zucchini', 'cucumber', 'celery', 'garlic', 'mushroom', 'eggplant', 'cabbage', 'arugula', 'leek', 'asparagus', 'pumpkin', 'squash', 'radish', 'beet', 'potato', 'corn', 'pea', 'bean sprout', 'green onion', 'scallion', 'kale', 'chard', 'brussels'],
      },
      {
        id: 'fruits',
        name: language === 'es' ? 'Frutas' : 'Fruits',
        icon: '🍎',
        keywords: ['banana', 'apple', 'lemon', 'orange', 'berry', 'blueberry', 'strawberry', 'raspberry', 'cherry', 'mango', 'pear', 'peach', 'grape', 'melon', 'watermelon', 'pineapple', 'kiwi', 'mandarin', 'lime', 'fig', 'date', 'raisin', 'cranberry', 'avocado'],
      },
      {
        id: 'proteins',
        name: language === 'es' ? 'Proteínas' : 'Proteins',
        icon: '🥩',
        keywords: ['chicken', 'beef', 'fish', 'tuna', 'salmon', 'egg', 'turkey', 'pork', 'shrimp', 'meat', 'fillet', 'breast', 'thigh'],
      },
      {
        id: 'dairy',
        name: language === 'es' ? 'Lácteos' : 'Dairy',
        icon: '🧀',
        keywords: ['cheese', 'milk', 'yogurt', 'cream', 'butter', 'ricotta', 'mozzarella', 'parmesan', 'feta', 'cottage', 'sour cream', 'whey'],
      },
      {
        id: 'grains',
        name: language === 'es' ? 'Granos y Cereales' : 'Grains & Cereals',
        icon: '🌾',
        keywords: ['oat', 'rice', 'quinoa', 'pasta', 'bread', 'flour', 'wheat', 'barley', 'corn', 'tortilla', 'noodle', 'couscous', 'cereal', 'granola', 'cornmeal'],
      },
      {
        id: 'legumes',
        name: language === 'es' ? 'Legumbres' : 'Legumes',
        icon: '🫘',
        keywords: ['chickpea', 'lentil', 'bean', 'black bean', 'kidney', 'pinto', 'white bean', 'soy', 'tofu', 'tempeh', 'seitan', 'edamame', 'hummus'],
      },
      {
        id: 'nuts',
        name: language === 'es' ? 'Frutos Secos' : 'Nuts & Seeds',
        icon: '🥜',
        keywords: ['almond', 'walnut', 'cashew', 'peanut', 'hazelnut', 'pistachio', 'pecan', 'nut', 'seed', 'sunflower', 'pumpkin seed', 'chia', 'flax', 'sesame', 'coconut'],
      },
      {
        id: 'pantry',
        name: language === 'es' ? 'Despensa' : 'Pantry Staples',
        icon: '🏪',
        keywords: ['oil', 'olive', 'vinegar', 'salt', 'pepper', 'sugar', 'honey', 'maple', 'vanilla', 'cinnamon', 'spice', 'seasoning', 'sauce', 'soy sauce', 'broth', 'stock', 'baking', 'cocoa', 'chocolate', 'yeast', 'powder'],
      },
    ];

    // Get top items and categorize them
    const topItems = shoppingData.items.slice(0, 70);

    // Categorize items
    const categorizedItems: Record<string, Array<{ name: string; recipeCount: number }>> = {};

    for (const item of topItems) {
      const cleanName = item.item.replace(/,\s*$/, '').trim().toLowerCase();
      let assignedCategory = 'pantry'; // default

      for (const cat of categoryDefs) {
        if (cat.keywords.some(keyword => cleanName.includes(keyword))) {
          assignedCategory = cat.id;
          break;
        }
      }

      if (!categorizedItems[assignedCategory]) {
        categorizedItems[assignedCategory] = [];
      }

      categorizedItems[assignedCategory].push({
        name: item.item.replace(/,\s*$/, '').trim(),
        recipeCount: item.recipe_count,
      });
    }

    // Minimum items to have its own category
    const MIN_ITEMS_FOR_CATEGORY = 4;

    // Build final categories - separate large from small
    const mainCategories: Array<{ id: string; name: string; icon: string; items: Array<{ name: string; recipeCount: number }> }> = [];
    const otherItems: Array<{ name: string; recipeCount: number; categoryIcon: string }> = [];

    for (const cat of categoryDefs) {
      const items = categorizedItems[cat.id];
      if (!items || items.length === 0) continue;

      if (items.length >= MIN_ITEMS_FOR_CATEGORY) {
        // Large enough for its own category
        mainCategories.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          items: items,
        });
      } else {
        // Add to "Other Essentials" with category icon as badge
        for (const item of items) {
          otherItems.push({
            ...item,
            categoryIcon: cat.icon,
          });
        }
      }
    }

    // Sort other items by recipe count
    otherItems.sort((a, b) => b.recipeCount - a.recipeCount);

    return {
      ...config,
      shoppingCategories: mainCategories,
      otherEssentials: otherItems,
      hasOtherEssentials: otherItems.length > 0,
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

  // Get favorite recipes organized by meal type
  getFavoritesByMeal(language: 'en' | 'es' = 'en'): {
    breakfast: RecipeData[];
    lunch: RecipeData[];
    snacks: RecipeData[];
    dinner: RecipeData[];
  } {
    const recipes = language === 'es' ? this.recipesEs : this.recipesEn;
    const favorites = recipes.filter(r => r.tier === 'favorite');

    // Sort by sortOrder (nulls/undefined last)
    const sorted = favorites.sort((a, b) => {
      if (a.sortOrder == null && b.sortOrder == null) return 0;
      if (a.sortOrder == null) return 1;
      if (b.sortOrder == null) return -1;
      return a.sortOrder - b.sortOrder;
    });

    return {
      breakfast: sorted.filter(r => r.category === 'breakfast' || r.category === 'base'),
      lunch: sorted.filter(r => r.category === 'lunch'),
      snacks: sorted.filter(r => r.category === 'snacks' || r.category === 'energy-bars'),
      dinner: sorted.filter(r => r.category === 'dinner'),
    };
  }

  // Get non-favorite recipes (for "When I'm Inspired" section)
  getStandardRecipes(language: 'en' | 'es' = 'en'): RecipeData[] {
    const recipes = language === 'es' ? this.recipesEs : this.recipesEn;
    return recipes.filter(r => r.tier !== 'favorite' && r.ingredients && r.ingredients.length > 0);
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
