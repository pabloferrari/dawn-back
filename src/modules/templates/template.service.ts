// src/modules/templates/template.service.ts
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

type Translations = Record<string, any>;

@Injectable()
export class TemplateService {
  private templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private translationsCache: Map<string, Translations> = new Map();

  constructor() {
    this.registerHelpers();
  }

  async compile(productType: string, templateName: string, data: any): Promise<string> {
    const key = `${productType}/${templateName}`;
    const isDev = process.env.NODE_ENV !== 'production';

    // In development, always reload templates from disk
    let template = isDev ? null : this.templatesCache.get(key);

    if (!template) {
      const templatePath = path.join(
        process.cwd(),
        'templates',
        productType,
        `${templateName}.hbs`,
      );
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      template = Handlebars.compile(templateContent);
      if (!isDev) {
        this.templatesCache.set(key, template);
      }
    }

    // Load translations if language is specified
    const language = data.language || 'en';
    const translations = await this.loadTranslations(productType, language);

    // Merge translations into data
    const dataWithTranslations = {
      ...data,
      t: translations,
      lang: language,
    };

    // Debug: log customization being passed to template
    // if (data.customization) {
    //   console.log(`[Template] ${templateName} - fontFamily: ${data.customization.fontFamily}`);
    // }

    return template(dataWithTranslations);
  }

  private async loadTranslations(productType: string, language: string): Promise<Translations> {
    const cacheKey = `${productType}/${language}`;

    if (this.translationsCache.has(cacheKey)) {
      return this.translationsCache.get(cacheKey)!;
    }

    const translationPath = path.join(
      process.cwd(),
      'locales',
      productType,
      `${language}.json`,
    );

    // console.log(`[Translations] Loading: ${translationPath}`);
    // console.log(`[Translations] CWD: ${process.cwd()}`);

    try {
      const content = await fs.readFile(translationPath, 'utf-8');
      const translations = JSON.parse(content);
      this.translationsCache.set(cacheKey, translations);
      console.log(`[Translations] ✅ Loaded successfully: ${productType}/${language}`);
      return translations;
    } catch (error) {
      console.error(`[Translations] ❌ Error loading ${translationPath}:`, error.message);
      // Fallback to English if translation file not found
      if (language !== 'en') {
        console.warn(`Translation file not found for ${productType}/${language}, falling back to English`);
        return this.loadTranslations(productType, 'en');
      }
      // Return empty object if even English is not found
      console.warn(`No translation files found for ${productType}`);
      return {};
    }
  }

  // Clear caches (useful for development)
  clearCache() {
    this.templatesCache.clear();
    this.translationsCache.clear();
  }

  private registerHelpers() {
    // Helper para comparar igualdad
    Handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    // Helper para operación OR
    Handlebars.registerHelper('or', function (...args) {
      // Remove the last argument (Handlebars options object)
      args.pop();
      return args.some(Boolean);
    });

    // Helper para sumar números
    Handlebars.registerHelper('add', function (a, b) {
      return Number(a) + Number(b);
    });

    // Helper para repetir elementos N veces
    Handlebars.registerHelper('times', function (n, block) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += block.fn(i);
      }
      return result;
    });

    // Helper para formatear moneda (respects language)
    Handlebars.registerHelper('currency', function (amount, options) {
      const lang = options.data.root.lang || 'en';
      const locale = lang === 'es' ? 'es-MX' : 'en-US';
      const currency = lang === 'es' ? 'MXN' : 'USD';

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    });

    // Helper para obtener traducción de mes
    Handlebars.registerHelper('monthName', function (monthIndex, options) {
      const months = options.data.root.t?.months;
      if (!months) return monthIndex;

      const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december'];
      return months[monthKeys[monthIndex]] || monthIndex;
    });

    // Helper para interpolar variables en traducciones
    // Uso: {{tt t.quickStart.day7Title year=year}}
    // Reemplaza {{year}} en el string con el valor de year
    Handlebars.registerHelper('tt', function (text, options) {
      if (!text || typeof text !== 'string') return text;

      let result = text;
      const hash = options.hash || {};

      // Reemplazar {{variable}} con los valores del hash
      for (const [key, value] of Object.entries(hash)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, String(value));
      }

      return result;
    });

    // Helper para extraer emojis de ingredientes
    Handlebars.registerHelper('ingredientEmojis', function (ingredients: string[]) {
      const emojiMap: Record<string, string> = {
        // Vegetables
        'tomato': '🍅', 'tomatoes': '🍅',
        'carrot': '🥕', 'carrots': '🥕',
        'onion': '🧅', 'onions': '🧅',
        'lettuce': '🥬', 'spinach': '🥬', 'cabbage': '🥬', 'arugula': '🥬',
        'cucumber': '🥒', 'zucchini': '🥒',
        'pepper': '🫑', 'bell pepper': '🫑',
        'potato': '🥔', 'potatoes': '🥔',
        'broccoli': '🥦',
        'mushroom': '🍄', 'mushrooms': '🍄',
        'garlic': '🧄',
        'eggplant': '🍆',
        'corn': '🌽',
        'avocado': '🥑',
        // Proteins
        'egg': '🥚', 'eggs': '🥚',
        'chicken': '🍗',
        'beef': '🥩', 'meat': '🥩',
        'fish': '🐟', 'tuna': '🐟', 'salmon': '🐟',
        'cheese': '🧀',
        // Legumes & Grains
        'chickpea': '🫘', 'chickpeas': '🫘', 'beans': '🫘', 'lentil': '🫘', 'lentils': '🫘',
        'rice': '🍚',
        'pasta': '🍝',
        'bread': '🍞',
        'oats': '🌾', 'oat': '🌾', 'flour': '🌾', 'quinoa': '🌾', 'wheat': '🌾',
        // Fruits
        'banana': '🍌', 'bananas': '🍌',
        'apple': '🍎', 'apples': '🍎',
        'lemon': '🍋', 'lemons': '🍋',
        'orange': '🍊',
        'berries': '🫐', 'blueberries': '🫐', 'strawberries': '🍓',
        // Dairy & Others
        'milk': '🥛', 'yogurt': '🥛',
        'butter': '🧈',
        'honey': '🍯',
        'nuts': '🥜', 'almond': '🥜', 'almonds': '🥜', 'walnut': '🥜', 'walnuts': '🥜', 'peanut': '🥜',
        'olive oil': '🫒', 'oil': '🫒',
        'water': '💧',
        'salt': '🧂',
        'chocolate': '🍫', 'cocoa': '🍫',
      };

      const foundEmojis = new Set<string>();
      const ingredientText = ingredients.join(' ').toLowerCase();

      for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (ingredientText.includes(keyword) && foundEmojis.size < 5) {
          foundEmojis.add(emoji);
        }
      }

      return Array.from(foundEmojis).join(' ');
    });
  }
}
