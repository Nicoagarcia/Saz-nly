import { Recipe, ParsedAmount, RecipeNutrition, NutritionData } from "../types";
import {
  getAllNutritionData,
  getUnitConversion,
  addNutritionData,
} from "../services/nutritionDatabase";
import { searchInLocalUSDA } from "./usdaLocalJson";

let nutritionCache: NutritionData[] | null = null;

const loadNutritionCache = (): NutritionData[] => {
  if (!nutritionCache) {
    nutritionCache = getAllNutritionData();
  }
  return nutritionCache;
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
    if (/(harina|pan\s*rallado)/i.test(nameLower)) {
      ingredientCategory = "flour";
    } else if (/(azúcar|miel)/i.test(nameLower)) {
      ingredientCategory = "sugar";
    } else if (/(arroz|quinoa)/i.test(nameLower)) {
      ingredientCategory = "grain";
    } else if (/(aceite|manteca|grasa)/i.test(nameLower)) {
      ingredientCategory = "fat";
    } else if (/(huevo)/i.test(nameLower)) {
      ingredientCategory = "egg";
    } else if (/(ajo)/i.test(nameLower)) {
      ingredientCategory = "garlic";
    } else {
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
  if (normalized === "unidad" && /huevo/i.test(ingredientName))
    return quantity * 50;

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

  let match = nutritionDatabase.find(
    (item) => normalize(item.ingredient_name) === normalized
  );
  if (match) return match;

  match = nutritionDatabase.find((item) =>
    normalized.includes(normalize(item.ingredient_name))
  );
  if (match) return match;

  match = nutritionDatabase.find((item) =>
    normalize(item.ingredient_name).includes(normalized)
  );
  if (match) return match;

  const words = normalized.split(/\s+/);
  match = nutritionDatabase.find((item) => {
    const itemWords = normalize(item.ingredient_name).split(/\s+/);
    return words.some((w) => itemWords.includes(w) && w.length > 2);
  });
  if (match) return match;

  const aliases: { [key: string]: string } = {
    "carne molida": "carne picada",
    res: "carne de res",
    parmesano: "queso parmesano",
    "queso rallado": "queso parmesano",
    cherry: "tomate",
    "tomates cherry": "tomate",
    cebollas: "cebolla",
    tomates: "tomate",
    huevos: "huevo",
  };

  if (aliases[normalized]) {
    match = nutritionDatabase.find(
      (item) =>
        normalize(item.ingredient_name) === normalize(aliases[normalized])
    );
    if (match) return match;
  }

  console.log(
    `📂 Ingrediente "${ingredientName}" no encontrado en BD, buscando en JSON local...`
  );

  try {
    const localData = searchInLocalUSDA(ingredientName);

    if (localData) {
      console.log(`Encontrado en JSON local`);

      const saved = addNutritionData(localData);

      if (saved) {
        nutritionCache?.push(localData);
        console.log(`Ingrediente "${ingredientName}" guardado en BD local`);
      }

      return localData;
    }
  } catch (error) {
    console.error(`Error al buscar "${ingredientName}" en JSON local:`, error);
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
