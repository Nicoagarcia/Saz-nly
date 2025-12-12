import { Recipe, ParsedAmount, RecipeNutrition, NutritionData } from "../types";
import {
  getAllNutritionData,
  getUnitConversion,
} from "../services/nutritionDatabase";

let nutritionCache: NutritionData[] | null = null;

const loadNutritionCache = (): NutritionData[] => {
  if (!nutritionCache) {
    nutritionCache = getAllNutritionData();
    console.log(
      `Caché de nutrición cargada: ${nutritionCache.length} ingredientes`
    );
  }
  return nutritionCache;
};

export const reloadNutritionCache = () => {
  nutritionCache = null;
  const newCache = loadNutritionCache();
  console.log(`Caché de nutrición recargada: ${newCache.length} ingredientes`);
};

export const parseIngredientAmount = (amountString: string): ParsedAmount => {
  const normalized = amountString.toLowerCase().trim();

  if (/(al?\s*gusto|opcional|algunas?|un\s*poco|c\/n)/i.test(normalized)) {
    return { quantity: 0, unit: "variable", grams: 0 };
  }

  const parenMatch = normalized.match(/\((\d+(?:\.\d+)?)\s*g\)/);
  if (parenMatch) {
    const grams = parseFloat(parenMatch[1]);
    return { quantity: grams, unit: "g", grams };
  }

  const rangeMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(taza|cucharada|cucharadita|g|kg|ml|l|unidad)/i
  );
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const avg = (min + max) / 2;
    const unit = rangeMatch[3];
    return { quantity: avg, unit, grams: null };
  }

  const unitMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|taza|tazas|cucharada|cucharadas|cucharadita|cucharaditas|unidad|unidades|diente|dientes)/i
  );
  if (unitMatch) {
    const quantity = parseFloat(unitMatch[1]);
    let unit = unitMatch[2].toLowerCase();

    unit = unit.replace(/s$/, "");

    if (unit === "g") {
      return { quantity, unit, grams: quantity };
    }
    if (unit === "kg") {
      return { quantity, unit, grams: quantity * 1000 };
    }

    return { quantity, unit, grams: null };
  }

  const numberMatch = normalized.match(/^(\d+(?:\.\d+)?)$/);
  if (numberMatch) {
    const quantity = parseFloat(numberMatch[1]);
    return { quantity, unit: "g", grams: quantity };
  }

  console.warn(`No se pudo parsear cantidad: "${amountString}"`);
  return { quantity: 0, unit: "unknown", grams: 0 };
};

export const convertToGrams = (
  quantity: number,
  unit: string,
  ingredientName: string,
  category?: string
): number | null => {
  const normalized = unit.toLowerCase().trim();

  if (normalized === "g") return quantity;
  if (normalized === "kg") return quantity * 1000;

  let ingredientCategory = category;
  if (!ingredientCategory) {
    const nameLower = ingredientName.toLowerCase();

    // Harinas y panes
    if (/(harina|pan\s*rallado)/i.test(nameLower)) {
      ingredientCategory = "flour";
    }
    // Azúcares
    else if (/(azúcar|azucar|miel)/i.test(nameLower)) {
      ingredientCategory = "sugar";
    }
    // Granos
    else if (/(arroz|quinoa)/i.test(nameLower)) {
      ingredientCategory = "grain";
    }
    // Grasas
    else if (/(aceite|manteca|mantequilla|grasa)/i.test(nameLower)) {
      ingredientCategory = "fat";
    }
    // Huevos
    else if (/(huevo)/i.test(nameLower)) {
      ingredientCategory = "egg";
    }
    // Palta/Aguacate
    else if (/(palta|aguacate|avocado)/i.test(nameLower)) {
      ingredientCategory = "avocado";
    }
    // Limón/Lima
    else if (/(limón|limon|lemon)/i.test(nameLower)) {
      ingredientCategory = "lemon";
    } else if (/(lima|lime)/i.test(nameLower)) {
      ingredientCategory = "lime";
    }
    // Cebollas
    else if (/(cebolla|onion)/i.test(nameLower)) {
      ingredientCategory = "onion";
    }
    // Tomates
    else if (/(tomate|tomato)/i.test(nameLower)) {
      ingredientCategory = "tomato";
    }
    // Papas
    else if (/(papa|patata|potato)/i.test(nameLower)) {
      ingredientCategory = "potato";
    }
    // Manzanas
    else if (/(manzana|apple)/i.test(nameLower)) {
      ingredientCategory = "apple";
    }
    // Bananas
    else if (/(banana|plátano|platano|banano)/i.test(nameLower)) {
      ingredientCategory = "banana";
    }
    // Naranjas
    else if (/(naranja|orange)/i.test(nameLower)) {
      ingredientCategory = "orange";
    }
    // Zanahorias
    else if (/(zanahoria|carrot)/i.test(nameLower)) {
      ingredientCategory = "carrot";
    }
    // Morrones/Pimientos
    else if (/(morrón|morron|pimiento|bell\s*pepper|pepper)/i.test(nameLower)) {
      ingredientCategory = "bell_pepper";
    }
    // Ajo
    else if (/(ajo|garlic)/i.test(nameLower)) {
      ingredientCategory = "garlic";
    }
    // Default: líquido
    else {
      ingredientCategory = "liquid";
    }
  }

  const conversion = getUnitConversion(normalized, ingredientCategory);
  if (conversion) {
    return quantity * conversion.grams_per_unit;
  }

  const fallbackConversions: { [key: string]: { [key: string]: number } } = {
    liquid: { taza: 240, cucharada: 15, cucharadita: 5, ml: 1, l: 1000 },
    flour: { taza: 120, cucharada: 8 },
    sugar: { taza: 200, cucharada: 12 },
    grain: { taza: 185 },
    fat: { cucharada: 14, cucharadita: 5 },
    egg: { unidad: 50 },
    garlic: { diente: 3 },
    avocado: { unidad: 150 },
    lemon: { unidad: 58 },
    lime: { unidad: 67 },
    onion: { unidad: 150 },
    tomato: { unidad: 123 },
    potato: { unidad: 173 },
    apple: { unidad: 182 },
    banana: { unidad: 118 },
    orange: { unidad: 131 },
    carrot: { unidad: 61 },
    bell_pepper: { unidad: 119 },
  };

  if (
    ingredientCategory &&
    fallbackConversions[ingredientCategory]?.[normalized]
  ) {
    return quantity * fallbackConversions[ingredientCategory][normalized];
  }

  if (normalized === "taza") return quantity * 240;
  if (normalized === "cucharada") return quantity * 15;
  if (normalized === "cucharadita") return quantity * 5;
  if (normalized === "ml") return quantity * 1;
  if (normalized === "l") return quantity * 1000;

  // Fallbacks finales por ingrediente específico
  if (normalized === "unidad") {
    const nameLower = ingredientName.toLowerCase();
    if (/huevo/i.test(nameLower)) return quantity * 50;
    if (/(palta|aguacate)/i.test(nameLower)) return quantity * 150;
    if (/(limón|limon)/i.test(nameLower)) return quantity * 58;
    if (/cebolla/i.test(nameLower)) return quantity * 150;
    if (/tomate/i.test(nameLower)) return quantity * 123;
    if (/(papa|patata)/i.test(nameLower)) return quantity * 173;
    if (/manzana/i.test(nameLower)) return quantity * 182;
    if (/(banana|plátano)/i.test(nameLower)) return quantity * 118;
    if (/(morrón|morron|pimiento)/i.test(nameLower)) return quantity * 119;
  }

  console.warn(
    `No se pudo convertir ${quantity} ${unit} de "${ingredientName}" a gramos`
  );
  return null;
};

export const findBestNutritionMatch = async (
  ingredientName: string,
  nutritionDatabase: NutritionData[]
): Promise<NutritionData | null> => {
  const normalize = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const normalized = normalize(ingredientName);

  // 1. Búsqueda exacta en español (prioridad)
  let match = nutritionDatabase.find((item) => {
    const spanishName = item.spanish_name ? normalize(item.spanish_name) : null;
    return spanishName === normalized;
  });
  if (match) return match;

  // 2. Búsqueda exacta en inglés
  match = nutritionDatabase.find(
    (item) => normalize(item.ingredient_name) === normalized
  );
  if (match) return match;

  // 3. Búsqueda parcial en español (ingrediente contiene búsqueda)
  match = nutritionDatabase.find((item) => {
    const spanishName = item.spanish_name ? normalize(item.spanish_name) : null;
    return spanishName && spanishName.includes(normalized);
  });
  if (match) return match;

  // 4. Búsqueda parcial en inglés
  match = nutritionDatabase.find((item) =>
    normalize(item.ingredient_name).includes(normalized)
  );
  if (match) return match;

  // 5. Búsqueda inversa en español (búsqueda contiene ingrediente)
  match = nutritionDatabase.find((item) => {
    const spanishName = item.spanish_name ? normalize(item.spanish_name) : null;
    return spanishName && normalized.includes(spanishName);
  });
  if (match) return match;

  // 6. Búsqueda inversa en inglés
  match = nutritionDatabase.find((item) =>
    normalized.includes(normalize(item.ingredient_name))
  );
  if (match) return match;

  // 7. Búsqueda por palabras en español
  const words = normalized.split(/\s+/);
  match = nutritionDatabase.find((item) => {
    const spanishName = item.spanish_name ? normalize(item.spanish_name) : null;
    if (!spanishName) return false;
    const itemWords = spanishName.split(/\s+/);
    return words.some((w) => itemWords.includes(w) && w.length > 2);
  });
  if (match) return match;

  // 8. Búsqueda por palabras en inglés
  match = nutritionDatabase.find((item) => {
    const itemWords = normalize(item.ingredient_name).split(/\s+/);
    return words.some((w) => itemWords.includes(w) && w.length > 2);
  });
  if (match) return match;

  // 9. Alias comunes (último recurso)
  const aliases: { [key: string]: string } = {
    "carne molida": "carne picada",
    res: "carne de res",
    cherry: "tomate",
    "tomates cherry": "tomate",
    cebollas: "cebolla",
    tomates: "tomate",
    huevos: "huevo",
  };

  if (aliases[normalized]) {
    match = nutritionDatabase.find(
      (item) =>
        normalize(item.ingredient_name) === normalize(aliases[normalized]) ||
        (item.spanish_name &&
          normalize(item.spanish_name) === normalize(aliases[normalized]))
    );
    if (match) return match;
  }

  console.warn(
    `No se encontraron datos nutricionales para "${ingredientName}"`
  );
  return null;
};

export const calculateRecipeNutrition = async (
  recipe: Recipe
): Promise<RecipeNutrition> => {
  const nutritionDB = loadNutritionCache();

  const totals = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
    vitamin_a_dv: 0,
    vitamin_c_dv: 0,
    calcium_dv: 0,
    iron_dv: 0,
  };

  const missingIngredients: string[] = [];

  for (const ingredient of recipe.ingredients) {
    const parsed = parseIngredientAmount(ingredient.amount);

    if (parsed.quantity === 0) {
      console.log(
        `Saltando ingrediente "${ingredient.item}" (al gusto o cantidad 0)`
      );
      continue;
    }

    let grams: number | null = parsed.grams;
    if (grams === null) {
      grams = convertToGrams(parsed.quantity, parsed.unit, ingredient.item);
    }

    if (grams === null || grams === 0) {
      console.warn(
        `No se pudieron calcular gramos para "${ingredient.item}" (${ingredient.amount})`
      );
      missingIngredients.push(ingredient.item);
      continue;
    }

    const nutritionData = await findBestNutritionMatch(
      ingredient.item,
      nutritionDB
    );

    if (!nutritionData) {
      console.warn(
        `No se encontraron datos nutricionales para "${ingredient.item}"`
      );
      missingIngredients.push(ingredient.item);
      continue;
    }

    const scaleFactor = grams / 100;

    totals.calories += nutritionData.calories * scaleFactor;
    totals.protein_g += nutritionData.protein_g * scaleFactor;
    totals.carbs_g += nutritionData.carbs_g * scaleFactor;
    totals.fat_g += nutritionData.fat_g * scaleFactor;
    totals.fiber_g += nutritionData.fiber_g * scaleFactor;
    totals.sugar_g += nutritionData.sugar_g * scaleFactor;
    totals.sodium_mg += nutritionData.sodium_mg * scaleFactor;
    totals.vitamin_a_dv += nutritionData.vitamin_a_dv * scaleFactor;
    totals.vitamin_c_dv += nutritionData.vitamin_c_dv * scaleFactor;
    totals.calcium_dv += nutritionData.calcium_dv * scaleFactor;
    totals.iron_dv += nutritionData.iron_dv * scaleFactor;

    console.log(
      `✓ ${ingredient.item}: ${grams.toFixed(1)}g → ${(
        nutritionData.calories * scaleFactor
      ).toFixed(0)} cal`
    );
  }

  const servings = recipe.servings || 1;
  const perServing: RecipeNutrition = {
    calories_per_serving: Math.round(totals.calories / servings),
    protein_g: Math.round((totals.protein_g / servings) * 10) / 10,
    carbs_g: Math.round((totals.carbs_g / servings) * 10) / 10,
    fat_g: Math.round((totals.fat_g / servings) * 10) / 10,
    fiber_g: Math.round((totals.fiber_g / servings) * 10) / 10,
    sugar_g: Math.round((totals.sugar_g / servings) * 10) / 10,
    sodium_mg: Math.round(totals.sodium_mg / servings),
    vitamin_a_dv: Math.round(totals.vitamin_a_dv / servings),
    vitamin_c_dv: Math.round(totals.vitamin_c_dv / servings),
    calcium_dv: Math.round(totals.calcium_dv / servings),
    iron_dv: Math.round(totals.iron_dv / servings),
    servings,
    missing_ingredients:
      missingIngredients.length > 0 ? missingIngredients : undefined,
  };

  console.log(
    `Nutrición calculada: ${perServing.calories_per_serving} cal/porción (${servings} porciones)`
  );

  return perServing;
};
