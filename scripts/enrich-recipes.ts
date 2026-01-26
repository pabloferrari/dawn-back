/**
 * Script to enrich recipes with nutritional data using Claude AI
 *
 * Usage:
 *   npx tsx scripts/enrich-recipes.ts --key=sk-ant-xxx
 *   # or
 *   ANTHROPIC_API_KEY=your-key npx tsx scripts/enrich-recipes.ts
 *
 * Options:
 *   --key=KEY    Anthropic API key (or use ANTHROPIC_API_KEY env var)
 *   --dry-run    Preview without saving
 *   --limit=N    Process only first N recipes
 *   --lang=es    Process Spanish version (default: en)
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface RecipeData {
  id: string;
  title: string;
  ingredients: string[];
  preparation: string[];
  notes: string[];
  category: string;
  tags: string[];
}

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface TimingInfo {
  bestConsumed: string;
  digestionTime: number; // minutes
  idealFor: string[];
}

type TrainingPhase = 'base' | 'build' | 'peak' | 'recovery';

interface EnrichedRecipe extends RecipeData {
  nutrition: NutritionInfo;
  timing: TimingInfo;
  trainingPhase: TrainingPhase[];
  prepTime: number;
  servings: number;
}

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
const langArg = args.find(a => a.startsWith('--lang='));
const lang = langArg ? langArg.split('=')[1] : 'en';
const keyArg = args.find(a => a.startsWith('--key='));
const apiKey = keyArg ? keyArg.split('=')[1] : process.env.ANTHROPIC_API_KEY;

if (!apiKey && !dryRun) {
  console.error('❌ Missing API key. Use --key=sk-ant-xxx or set ANTHROPIC_API_KEY');
  process.exit(1);
}

// Paths
const dataPath = path.join(__dirname, '../src/modules/products/athlete-cookbook/data');
const inputFile = path.join(dataPath, `fuel_like_a_runner-${lang}.json`);
const outputFile = path.join(dataPath, `fuel_like_a_runner-${lang}-enriched.json`);
const progressFile = path.join(dataPath, `.enrich-progress-${lang}.json`);

// Initialize Anthropic client
const anthropic = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `You are a sports nutrition expert. Analyze recipes and provide accurate nutritional estimates for athletes.

For each recipe, estimate:
1. Nutritional values (per serving):
   - calories (kcal)
   - protein (grams)
   - carbs (grams)
   - fat (grams)
   - fiber (grams)

2. Timing recommendations:
   - bestConsumed: when to eat relative to training (e.g., "2-3 hours before training", "within 30 minutes post-workout", "anytime")
   - digestionTime: estimated minutes to digest
   - idealFor: array of scenarios like ["long runs", "recovery days", "race day morning", "easy training days"]

3. Training phases where this recipe fits best (array, can be multiple):
   - "base": Base building phase (moderate carbs, good fats)
   - "build": Build phase (higher carbs, high protein)
   - "peak": Peak/race week (high carbs, easy digestion)
   - "recovery": Recovery phase (anti-inflammatory, protein-focused)

4. Prep time in minutes (estimate based on complexity)

5. Servings (estimate based on ingredient quantities)

Be realistic with estimates. Base calculations on typical portion sizes for athletes.
Respond ONLY with valid JSON, no markdown or explanation.`;

interface EnrichmentResult {
  nutrition: NutritionInfo;
  timing: TimingInfo;
  trainingPhase: TrainingPhase[];
  prepTime: number;
  servings: number;
}

async function enrichRecipe(recipe: RecipeData): Promise<EnrichmentResult> {
  const prompt = `Analyze this recipe for a runner's cookbook:

Title: ${recipe.title}
Category: ${recipe.category}
Tags: ${recipe.tags.join(', ')}

Ingredients:
${recipe.ingredients.map(i => `- ${i}`).join('\n')}

Preparation:
${recipe.preparation.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Provide nutritional data and timing recommendations as JSON:
{
  "nutrition": { "calories": N, "protein": N, "carbs": N, "fat": N, "fiber": N },
  "timing": { "bestConsumed": "string", "digestionTime": N, "idealFor": ["..."] },
  "trainingPhase": ["base"|"build"|"peak"|"recovery"],
  "prepTime": N,
  "servings": N
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse JSON from response: ${text}`);
  }

  return JSON.parse(jsonMatch[0]) as EnrichmentResult;
}

async function loadProgress(): Promise<Set<string>> {
  try {
    if (fs.existsSync(progressFile)) {
      const data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      return new Set(data.completed || []);
    }
  } catch (e) {
    console.log('No previous progress found, starting fresh');
  }
  return new Set();
}

async function saveProgress(completed: Set<string>): Promise<void> {
  fs.writeFileSync(progressFile, JSON.stringify({ completed: [...completed] }, null, 2));
}

async function loadExistingEnriched(): Promise<Map<string, EnrichedRecipe>> {
  const map = new Map<string, EnrichedRecipe>();
  try {
    if (fs.existsSync(outputFile)) {
      const data: EnrichedRecipe[] = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      for (const recipe of data) {
        map.set(recipe.id, recipe);
      }
    }
  } catch (e) {
    console.log('No existing enriched file, starting fresh');
  }
  return map;
}

async function main() {
  console.log(`\n🍳 Recipe Enrichment Script`);
  console.log(`${'─'.repeat(40)}`);
  console.log(`Language: ${lang}`);
  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  console.log(`Dry run: ${dryRun}`);
  if (limit) console.log(`Limit: ${limit} recipes`);
  console.log(`${'─'.repeat(40)}\n`);

  // Load recipes
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const recipes: RecipeData[] = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`📖 Loaded ${recipes.length} recipes`);

  // Load progress and existing enriched data
  const completed = await loadProgress();
  const enrichedMap = await loadExistingEnriched();

  console.log(`✅ Previously completed: ${completed.size} recipes`);
  console.log(`📦 Existing enriched: ${enrichedMap.size} recipes\n`);

  // Filter recipes to process
  let toProcess = recipes.filter(r => !completed.has(r.id));
  if (limit) {
    toProcess = toProcess.slice(0, limit);
  }

  console.log(`🔄 Processing ${toProcess.length} recipes...\n`);

  let processed = 0;
  let errors = 0;

  for (const recipe of toProcess) {
    try {
      process.stdout.write(`[${processed + 1}/${toProcess.length}] ${recipe.title.padEnd(40).slice(0, 40)} `);

      if (dryRun) {
        console.log('⏭️  (dry run)');
      } else {
        const enrichment = await enrichRecipe(recipe);

        const enrichedRecipe: EnrichedRecipe = {
          ...recipe,
          ...enrichment,
        };

        enrichedMap.set(recipe.id, enrichedRecipe);
        completed.add(recipe.id);

        // Save progress after each recipe
        await saveProgress(completed);

        // Save enriched data periodically (every 5 recipes)
        if ((processed + 1) % 5 === 0) {
          const allEnriched = recipes.map(r => enrichedMap.get(r.id) || r);
          fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
        }

        console.log(`✅ ${enrichment.nutrition.calories}cal | ${enrichment.nutrition.carbs}c/${enrichment.nutrition.protein}p/${enrichment.nutrition.fat}f`);

        // Rate limiting - small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      processed++;
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errors++;

      // Continue with next recipe
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Final save
  if (!dryRun) {
    const allEnriched = recipes.map(r => enrichedMap.get(r.id) || r);
    fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
    console.log(`\n💾 Saved to: ${outputFile}`);
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total enriched: ${enrichedMap.size}/${recipes.length}`);

  if (completed.size < recipes.length && !dryRun) {
    console.log(`\n💡 Run again to continue with remaining ${recipes.length - completed.size} recipes`);
  }
}

main().catch(console.error);
