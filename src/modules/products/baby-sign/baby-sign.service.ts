// src/modules/products/baby-sign/baby-sign.service.ts
import { Injectable } from '@nestjs/common';
import { PdfGeneratorService } from '../../pdf-generator/pdf-generator.service';
import { BabySignConfig, SignItem } from './interfaces/baby-sign-config.interface';
import { ProductGenerator } from '../../../common/interfaces/product-config.interface';

@Injectable()
export class BabySignService implements ProductGenerator {
  private readonly PRODUCT_TYPE = 'baby-sign';

  constructor(private readonly pdfGeneratorService: PdfGeneratorService) { }

  async generate(config: BabySignConfig): Promise<string> {
    const browser = await this.pdfGeneratorService.launchBrowser();

    try {
      const pdfBuffers: Buffer[] = [];

      // 1. Cover page
      console.log('Generando portada...');
      const coverBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'cover',
        config,
      );
      pdfBuffers.push(coverBuffer);

      // 2. Introduction pages
      if (config.includeIntro) {
        console.log('Generando introducción...');

        // Page 1: Why Baby Sign Language
        const whyBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'intro-why',
          config,
        );
        pdfBuffers.push(whyBuffer);

        // Page 2: When to Start
        const whenBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'intro-when',
          config,
        );
        pdfBuffers.push(whenBuffer);

        // Page 3: Tips for Teaching
        const tipsBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'intro-tips',
          config,
        );
        pdfBuffers.push(tipsBuffer);
      }

      // 3. Category index page (optional)
      console.log('Generando índice de categorías...');
      const indexData = this.generateCategoryIndex(config);
      const indexBuffer = await this.pdfGeneratorService.generatePage(
        browser,
        this.PRODUCT_TYPE,
        'category-index',
        indexData,
      );
      pdfBuffers.push(indexBuffer);

      // 4. Sign pages grouped by category
      console.log('Generando páginas de señas...');
      const groupedSigns = this.groupSignsByCategory(config.signs);

      for (const [category, signs] of Object.entries(groupedSigns)) {
        // Category divider page
        const dividerData = {
          ...config,
          categoryName: this.getCategoryDisplayName(category),
          categoryColor: this.getCategoryColor(category, config),
        };
        const dividerBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'category-divider',
          dividerData,
        );
        pdfBuffers.push(dividerBuffer);

        // Individual sign pages
        for (const sign of signs) {
          const signData = {
            ...config,
            sign,
            categoryColor: this.getCategoryColor(category, config),
          };
          const signBuffer = await this.pdfGeneratorService.generatePage(
            browser,
            this.PRODUCT_TYPE,
            'sign-page',
            signData,
          );
          pdfBuffers.push(signBuffer);
        }
      }

      // 5. Practice log
      if (config.includePracticeLog) {
        console.log('Generando practice log...');
        const logBuffer = await this.pdfGeneratorService.generatePage(
          browser,
          this.PRODUCT_TYPE,
          'practice-log',
          config,
        );
        pdfBuffers.push(logBuffer);
      }

      // 6. Merge all PDFs
      console.log('Combinando PDFs...');
      const finalPdf = await this.pdfGeneratorService.mergePdfs(pdfBuffers);

      // 7. Save
      const fileName = `baby-sign-guide-${Date.now()}.pdf`;
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

  validateConfig(config: BabySignConfig): boolean {
    return !!(
      config.year &&
      config.coverTitle &&
      config.customization &&
      config.signs &&
      config.signs.length > 0
    );
  }

  private groupSignsByCategory(signs: SignItem[]): Record<string, SignItem[]> {
    return signs.reduce((acc, sign) => {
      if (!acc[sign.category]) {
        acc[sign.category] = [];
      }
      acc[sign.category].push(sign);
      return acc;
    }, {} as Record<string, SignItem[]>);
  }

  private generateCategoryIndex(config: BabySignConfig) {
    const groupedSigns = this.groupSignsByCategory(config.signs);
    const categories = Object.entries(groupedSigns).map(([category, signs]) => ({
      name: this.getCategoryDisplayName(category),
      count: signs.length,
      color: this.getCategoryColor(category, config),
    }));

    return {
      ...config,
      categories,
    };
  }

  private getCategoryDisplayName(category: string): string {
    const names = {
      food: 'Food & Drink',
      routine: 'Daily Routine',
      emotions: 'Feelings & Emotions',
      animals: 'Animals',
      family: 'Family',
      actions: 'Actions & Activities',
    };
    return names[category] || category;
  }

  private getCategoryColor(category: string, config: BabySignConfig): string {
    // Check if custom colors are defined
    if (config.categories) {
      const customCategory = config.categories.find(c =>
        c.name.toLowerCase() === category.toLowerCase()
      );
      if (customCategory) return customCategory.color;
    }

    // Default colors
    const colors = {
      food: '#FF6B6B',
      routine: '#4ECDC4',
      emotions: '#FFE66D',
      animals: '#95E1D3',
      family: '#F38181',
      actions: '#AA96DA',
    };
    return colors[category] || config.customization.primaryColor;
  }

  getDefaultSigns(): SignItem[] {
    return [
      // Food category
      {
        word: 'MILK',
        category: 'food',
        howToSign: 'Open and close your fist repeatedly, like milking a cow',
        teachingTip: 'Sign this before every feeding session',
        contextExample: 'Sign "milk" when showing the bottle or before breastfeeding',
      },
      {
        word: 'EAT',
        category: 'food',
        howToSign: 'Bring fingertips to your mouth repeatedly',
        teachingTip: 'Use at mealtimes and when baby shows hunger cues',
        contextExample: 'Sign "eat" when preparing food or during mealtime',
      },
      {
        word: 'MORE',
        category: 'food',
        howToSign: 'Tap fingertips of both hands together',
        teachingTip: 'One of the first signs babies learn - very useful!',
        contextExample: 'Sign "more" when offering seconds or continuing an activity',
      },
      {
        word: 'WATER',
        category: 'food',
        howToSign: 'Make a "W" with three fingers and tap it to your chin',
        teachingTip: 'Sign when offering water or pointing to water',
        contextExample: 'Use during bath time and when drinking',
      },
      {
        word: 'ALL DONE',
        category: 'food',
        howToSign: 'Wave both hands back and forth with palms up',
        teachingTip: 'Helps baby communicate when they\'re finished eating',
        contextExample: 'Sign when baby stops eating or shows fullness',
      },

      // Routine category
      {
        word: 'SLEEP',
        category: 'routine',
        howToSign: 'Place hand on side of face like resting on a pillow',
        teachingTip: 'Use during bedtime routine',
        contextExample: 'Sign "sleep" when going to bed or naptime',
      },
      {
        word: 'BATH',
        category: 'routine',
        howToSign: 'Rub fists up and down on chest like washing',
        teachingTip: 'Sign before bath time to prepare baby',
        contextExample: 'Use when running the bath or getting towels',
      },
      {
        word: 'DIAPER',
        category: 'routine',
        howToSign: 'Tap fingers at hips where diaper fastens',
        teachingTip: 'Helps with potty training communication',
        contextExample: 'Sign during diaper changes',
      },

      // Emotions category
      {
        word: 'HAPPY',
        category: 'emotions',
        howToSign: 'Brush hand up chest repeatedly with a smile',
        teachingTip: 'Name the emotion when baby smiles',
        contextExample: 'Sign "happy" during playtime or when baby laughs',
      },
      {
        word: 'SAD',
        category: 'emotions',
        howToSign: 'Draw fingers down face like tears',
        teachingTip: 'Validate baby\'s feelings',
        contextExample: 'Use when baby cries or looks upset',
      },
      {
        word: 'HELP',
        category: 'emotions',
        howToSign: 'Place one fist on open palm and lift both up',
        teachingTip: 'Empowers baby to ask for assistance',
        contextExample: 'Sign when baby is struggling with something',
      },

      // Animals category
      {
        word: 'DOG',
        category: 'animals',
        howToSign: 'Pat your thigh and snap fingers like calling a dog',
        teachingTip: 'Point to dogs when outside',
        contextExample: 'Sign when seeing dogs in books or real life',
      },
      {
        word: 'CAT',
        category: 'animals',
        howToSign: 'Pinch fingers on cheek and pull out like whiskers',
        teachingTip: 'Combine with meow sounds',
        contextExample: 'Use when seeing cats or reading cat books',
      },
      {
        word: 'BIRD',
        category: 'animals',
        howToSign: 'Open and close fingers at mouth like a beak',
        teachingTip: 'Look for birds during walks',
        contextExample: 'Sign when birds are outside or in pictures',
      },

      // Family category
      {
        word: 'MAMA',
        category: 'family',
        howToSign: 'Tap thumb to chin with hand spread',
        teachingTip: 'One of baby\'s first important signs',
        contextExample: 'Sign when mama enters the room',
      },
      {
        word: 'DADA',
        category: 'family',
        howToSign: 'Tap thumb to forehead with hand spread',
        teachingTip: 'Partner should use this sign too',
        contextExample: 'Sign when dada comes home',
      },

      // Actions category
      {
        word: 'PLAY',
        category: 'actions',
        howToSign: 'Twist both hands with "Y" handshape',
        teachingTip: 'Use during fun activities',
        contextExample: 'Sign before starting playtime',
      },
      {
        word: 'BOOK',
        category: 'actions',
        howToSign: 'Place palms together and open like a book',
        teachingTip: 'Great for bedtime routine',
        contextExample: 'Sign when reading stories',
      },
      {
        word: 'MUSIC',
        category: 'actions',
        howToSign: 'Wave hand over opposite arm like conducting',
        teachingTip: 'Combine with singing',
        contextExample: 'Sign when playing music or singing songs',
      },
    ];
  }
}