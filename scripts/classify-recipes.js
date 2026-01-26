// Script to classify recipes and add categories/tags for athlete cookbook
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'recetario-completo.json');
const outputFile = path.join(__dirname, '..', 'recetario-clasificado.json');

const recipes = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Classification rules based on title and ingredients
function classifyRecipe(recipe) {
  const title = recipe.title.toLowerCase();
  const ingredients = recipe.ingredients.join(' ').toLowerCase();
  const notes = recipe.notes.join(' ').toLowerCase();
  const allText = `${title} ${ingredients} ${notes}`;

  let category = 'lunch'; // default
  let tags = ['fresh-ingredients'];

  // ============ ATHLETE-SPECIFIC CATEGORIES ============

  // PRE-RACE: Easy digest, high carb, familiar foods
  if (
    title.includes('días de carrera') ||
    title.includes('pre-race') ||
    title.includes('avena') && title.includes('entrenamiento intenso')
  ) {
    category = 'pre-race';
    tags.push('race-day', 'easy-digest', 'high-carb');
  }

  // POST-WORKOUT: High protein, recovery foods
  else if (
    title.includes('post entrenamiento') ||
    title.includes('después de entrenar') ||
    title.includes('pepitas de cúrcuma') || // anti-inflammatory
    (title.includes('burrito') && title.includes('desayuno'))
  ) {
    category = 'post-workout';
    tags.push('recovery', 'anti-inflammatory');
  }

  // ENERGY BARS: Portable, dense energy
  else if (
    title.includes('bocaditos energéticos') ||
    title.includes('trufa') ||
    title.includes('bananas masticables') ||
    (title.includes('galleta') && (ingredients.includes('avena') || ingredients.includes('banana'))) ||
    title.includes('crackers de semillas')
  ) {
    category = 'energy-bars';
    tags.push('portable', 'energy-dense', 'race-fuel');
  }

  // ============ MEAL CATEGORIES ============

  // BREAKFAST
  else if (
    title.includes('pancake') ||
    title.includes('waffle') ||
    title.includes('tostada francesa') ||
    title.includes('tostadas francesas') ||
    title.includes('omelette') ||
    title.includes('omelete') ||
    title.includes('smoothie bowl') ||
    title.includes('granola') ||
    title.includes('gránola') ||
    title.includes('hummus') ||
    title.includes('tostadas mediterráneas') ||
    (title.includes('avena') && title.includes('todos los días')) ||
    (title.includes('avena') && !title.includes('trufa') && !title.includes('galleta'))
  ) {
    category = 'breakfast';
    tags.push('morning-fuel');
  }

  // HYDRATION
  else if (
    title.includes('leche de avena') ||
    title.includes('leche de girasol')
  ) {
    category = 'hydration';
    tags.push('plant-based', 'dairy-free');
  }

  // SNACKS (portable, between meals)
  else if (
    title.includes('cookie') ||
    title.includes('muffin') ||
    title.includes('budin') ||
    title.includes('budín') ||
    title.includes('brownie') ||
    title.includes('scone') ||
    title.includes('snack') ||
    title.includes('macarrones de cacao') ||
    title.includes('crumble')
  ) {
    category = 'snacks';
    tags.push('portable', 'sweet');
  }

  // SOUPS - dinner, good for recovery
  else if (title.includes('sopa')) {
    category = 'dinner';
    tags.push('comfort-food', 'easy-digest', 'hydrating', 'recovery');
  }

  // SALADS - lunch
  else if (title.includes('ensalada')) {
    category = 'lunch';
    tags.push('light', 'high-fiber', 'vegetables');
  }

  // TARTAS - meal prep friendly
  else if (title.includes('tarta') && !title.includes('masa')) {
    category = 'lunch';
    tags.push('meal-prep', 'vegetables', 'batch-cooking');
  }

  // MAIN DISHES - dinner
  else if (
    title.includes('guiso') ||
    title.includes('lasagna') ||
    title.includes('pastel de pollo') ||
    title.includes('wok') ||
    title.includes('filet') ||
    title.includes('hamburguesa') ||
    title.includes('albondiga') ||
    title.includes('albóndiga') ||
    title.includes('berenjenas a la') ||
    title.includes('zapallitos rellenos') ||
    title.includes('pastas con') ||
    title.includes('bifecito')
  ) {
    category = 'dinner';
    tags.push('high-protein', 'satisfying');
  }

  // PIZZA - dinner
  else if (title.includes('pizza')) {
    category = 'dinner';
    tags.push('comfort-food');
  }

  // BASES & SPREADS
  else if (
    title.includes('pan ') ||
    title.includes('pan integral') ||
    title.includes('pan nube') ||
    title.includes('pancito') ||
    title.includes('ñoqui') ||
    title.includes('taco casero') ||
    title.includes('masa integral') ||
    title.includes('untable') ||
    title.includes('mermelada')
  ) {
    category = 'base';
    tags = ['base-recipe', 'meal-prep'];
  }

  // QUINOA INFO (not a recipe)
  else if (title.includes('important information') || notes.includes('no una receta')) {
    category = 'info';
    tags = ['informational', 'cooking-tips'];
  }

  // ============ ADD NUTRITIONAL TAGS ============

  // High protein
  if (
    ingredients.includes('pollo') ||
    ingredients.includes('atún') ||
    ingredients.includes('salmón') ||
    ingredients.includes('carne') ||
    ingredients.includes('huevo') ||
    ingredients.includes('lentejas') ||
    ingredients.includes('garbanzos') ||
    ingredients.includes('quinoa') ||
    ingredients.includes('yogur') ||
    title.includes('proteico')
  ) {
    tags.push('high-protein');
  }

  // Plant-based protein
  if (
    ingredients.includes('lentejas') ||
    ingredients.includes('garbanzos') ||
    ingredients.includes('quinoa') ||
    ingredients.includes('porotos') ||
    ingredients.includes('aduki') ||
    ingredients.includes('soja')
  ) {
    tags.push('plant-protein');
  }

  // Complex carbs
  if (
    ingredients.includes('avena') ||
    ingredients.includes('arroz integral') ||
    ingredients.includes('quinoa') ||
    ingredients.includes('harina integral') ||
    ingredients.includes('papa') ||
    ingredients.includes('calabaza') ||
    ingredients.includes('zapallo')
  ) {
    tags.push('complex-carbs');
  }

  // High fiber
  if (
    ingredients.includes('lentejas') ||
    ingredients.includes('garbanzos') ||
    ingredients.includes('avena') ||
    ingredients.includes('espinaca') ||
    ingredients.includes('brócoli') ||
    allText.includes('integral')
  ) {
    tags.push('high-fiber');
  }

  // Gluten free
  if (
    title.includes('sin tacc') ||
    title.includes('sin TACC') ||
    title.includes('quinoa') && !ingredients.includes('harina de trigo')
  ) {
    tags.push('gluten-free');
  }

  // Vegan
  if (
    title.includes('vegano') ||
    title.includes('vegan') ||
    (
      !ingredients.includes('huevo') &&
      !ingredients.includes('clara') &&
      !ingredients.includes('yema') &&
      !ingredients.includes('pollo') &&
      !ingredients.includes('carne') &&
      !ingredients.includes('atún') &&
      !ingredients.includes('salmón') &&
      !ingredients.includes('pescado') &&
      !ingredients.includes('queso') &&
      !ingredients.includes('ricota') &&
      !ingredients.includes('yogur') &&
      !ingredients.includes('leche') &&
      !ingredients.includes('mantequilla') &&
      !ingredients.includes('manteca')
    )
  ) {
    tags.push('vegan');
  }

  // Quick (simple preparation)
  if (recipe.preparation.length <= 4 && !title.includes('guiso') && !title.includes('hornear')) {
    tags.push('quick');
  }

  // No-cook
  if (
    title.includes('ensalada') ||
    title.includes('smoothie') ||
    title.includes('overnight') ||
    title.includes('sin cocción') ||
    (!allText.includes('hornear') && !allText.includes('hervir') && !allText.includes('cocinar') && !allText.includes('saltear'))
  ) {
    // Check if actually no-cook
    const prep = recipe.preparation.join(' ').toLowerCase();
    if (!prep.includes('horn') && !prep.includes('herv') && !prep.includes('cocin') && !prep.includes('sartén')) {
      tags.push('no-cook');
    }
  }

  // Anti-inflammatory (good for recovery)
  if (
    ingredients.includes('cúrcuma') ||
    ingredients.includes('jengibre') ||
    ingredients.includes('arándano') ||
    ingredients.includes('salmón') ||
    ingredients.includes('espinaca')
  ) {
    tags.push('anti-inflammatory');
  }

  // Meal prep friendly
  if (
    title.includes('hamburguesa') ||
    title.includes('muffin') ||
    title.includes('granola') ||
    notes.includes('freezar') ||
    notes.includes('congelar') ||
    notes.includes('semana')
  ) {
    tags.push('meal-prep');
  }

  // Remove duplicates
  tags = [...new Set(tags)];

  return { category, tags };
}

// Process all recipes
const classifiedRecipes = recipes.map((recipe, index) => {
  const { category, tags } = classifyRecipe(recipe);

  return {
    id: `recipe-${String(index + 1).padStart(3, '0')}`,
    ...recipe,
    category,
    tags,
  };
});

// Write output
fs.writeFileSync(outputFile, JSON.stringify(classifiedRecipes, null, 2), 'utf8');

console.log(`Processed ${classifiedRecipes.length} recipes`);
console.log(`Output saved to: ${outputFile}`);

// Print summary
const summary = {};
classifiedRecipes.forEach(r => {
  summary[r.category] = (summary[r.category] || 0) + 1;
});
console.log('\nCategories summary:');
Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

// Print tag summary
const tagSummary = {};
classifiedRecipes.forEach(r => {
  r.tags.forEach(tag => {
    tagSummary[tag] = (tagSummary[tag] || 0) + 1;
  });
});
console.log('\nTop tags:');
Object.entries(tagSummary)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([tag, count]) => {
    console.log(`  ${tag}: ${count}`);
  });
