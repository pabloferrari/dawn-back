// src/modules/products/athlete-cookbook/interfaces/athlete-cookbook-config.interface.ts
import { BaseProductConfig } from '../../../../common/interfaces/product-config.interface';

export interface AthleteCookbookConfig extends BaseProductConfig {
  productType: 'athlete-cookbook';
  subtitle?: string;
  athleteType: 'runner' | 'cyclist' | 'triathlete' | 'general';
  recipes: Recipe[];
  includeIntro: boolean;
  includeNutritionGuide: boolean;
  includeMealPlanner: boolean;
  includeShoppingList: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  description: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  timing: MealTiming;
  tags: string[];
  tips?: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export type RecipeCategory =
  | 'pre-workout'
  | 'post-workout'
  | 'pre-race'
  | 'post-race'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'
  | 'hydration'
  | 'energy-bars'
  | 'base'
  | 'info';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  isOptional?: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sodium?: number; // mg
}

export interface MealTiming {
  bestConsumed: string; // e.g., "2-3 hours before training"
  idealFor: string[]; // e.g., ["long runs", "race day", "recovery"]
}

export interface CategoryConfig {
  id: RecipeCategory;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    description: 'Start your day with energy-packed morning meals',
    color: '#F7B731',
    icon: '🌅',
  },
  {
    id: 'lunch',
    name: 'Lunch',
    description: 'Balanced midday meals to keep you fueled',
    color: '#26DE81',
    icon: '🥗',
  },
  {
    id: 'dinner',
    name: 'Dinner',
    description: 'Recovery-focused meals to end your day right',
    color: '#5D6EC4',
    icon: '🍽️',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    description: 'Quick bites to keep energy steady between meals',
    color: '#FC5C65',
    icon: '🍪',
  },
  {
    id: 'energy-bars',
    name: 'Energy Bars',
    description: 'Portable, homemade fuel for training and races',
    color: '#A55EEA',
    icon: '⚡',
  },
  {
    id: 'pre-race',
    name: 'Pre-Race',
    description: 'Easy-to-digest meals for race day preparation',
    color: '#FFE66D',
    icon: '🏃',
  },
  {
    id: 'post-workout',
    name: 'Post-Workout',
    description: 'Recovery meals to refuel within the golden window',
    color: '#4ECDC4',
    icon: '💪',
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout',
    description: 'Light fuel before training sessions',
    color: '#FF6B35',
    icon: '🔥',
  },
  {
    id: 'post-race',
    name: 'Post-Race',
    description: 'Celebrate and recover after race day',
    color: '#95E1D3',
    icon: '🎉',
  },
  {
    id: 'hydration',
    name: 'Hydration',
    description: 'Homemade drinks and plant-based milks',
    color: '#45AAF2',
    icon: '💧',
  },
  {
    id: 'base',
    name: 'Bases & Staples',
    description: 'Foundational recipes for breads, doughs, and spreads',
    color: '#8D6E63',
    icon: '🧈',
  },
  {
    id: 'info',
    name: 'Tips & Info',
    description: 'Helpful cooking tips and nutritional information',
    color: '#78909C',
    icon: 'ℹ️',
  },
];
