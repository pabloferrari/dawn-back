// src/modules/templates/template.service.ts
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerHelpers();
  }

  async compile(productType: string, templateName: string, data: any): Promise<string> {
    const key = `${productType}/${templateName}`;
    let template = this.templatesCache.get(key);

    if (!template) {
      const templatePath = path.join(
        process.cwd(),
        'templates',
        productType,
        `${templateName}.hbs`,
      );
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      template = Handlebars.compile(templateContent);
      this.templatesCache.set(key, template);
    }

    return template(data);
  }

  private registerHelpers() {
    // Helper para comparar igualdad
    Handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    // Helper para repetir elementos N veces
    Handlebars.registerHelper('times', function (n, block) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += block.fn(i);
      }
      return result;
    });

    // Helper para formatear moneda
    Handlebars.registerHelper('currency', function (amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    });
  }
}