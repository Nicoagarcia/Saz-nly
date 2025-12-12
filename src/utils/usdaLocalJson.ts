import { NutritionData } from "../types";

let localFoodsCache: any[] | null = null;

const translations: { [key: string]: string } = {
  carne: "beef",
  "carne picada": "ground beef",
  "carne molida": "ground beef",
  "carne de res": "beef",
  pollo: "chicken",
  pechuga: "chicken breast",
  "pechuga de pollo": "chicken breast",
  "muslo de pollo": "chicken thigh",
  huevo: "egg",
  huevos: "egg",
  "clara de huevo": "egg white",
  "yema de huevo": "egg yolk",
  garbanzos: "chickpeas",
  lentejas: "lentils",
  porotos: "beans",
  "porotos negros": "black beans",
  frijoles: "beans",
  atun: "tuna",
  atún: "tuna",
  salmon: "salmon",
  salmón: "salmon",
  cerdo: "pork",
  tocino: "bacon",
  panceta: "bacon",
  chorizo: "sausage",
  salchicha: "sausage",

  // GRANOS Y CEREALES
  pasta: "pasta",
  fideos: "pasta",
  tallarines: "pasta",
  spaguetti: "spaghetti",
  arroz: "rice",
  "arroz blanco": "white rice",
  "arroz integral": "brown rice",
  quinoa: "quinoa",
  quinua: "quinoa",
  harina: "wheat flour",
  "harina de trigo": "wheat flour",
  "harina integral": "whole wheat flour",
  pan: "bread",
  "pan blanco": "white bread",
  "pan integral": "whole wheat bread",
  "pan rallado": "bread crumbs",
  avena: "oats",
  cebada: "barley",
  maiz: "corn",
  maíz: "corn",

  // LÁCTEOS
  leche: "milk",
  "leche entera": "whole milk",
  "leche descremada": "skim milk",
  queso: "cheese",
  "queso parmesano": "parmesan cheese",
  parmesano: "parmesan",
  "queso rallado": "parmesan",
  mozzarella: "mozzarella",
  "queso crema": "cream cheese",
  manteca: "butter",
  mantequilla: "butter",
  crema: "cream",
  "crema de leche": "heavy cream",
  nata: "cream",
  yogur: "yogurt",
  yogurt: "yogurt",

  // VEGETALES
  tomate: "tomato",
  tomates: "tomato",
  "tomate cherry": "cherry tomato",
  cebolla: "onion",
  cebollas: "onion",
  "cebolla morada": "red onion",
  "cebolla de verdeo": "green onion",
  ajo: "garlic",
  "diente de ajo": "garlic",
  espinaca: "spinach",
  espinacas: "spinach",
  lechuga: "lettuce",
  zanahoria: "carrot",
  zanahorias: "carrot",
  pepino: "cucumber",
  papa: "potato",
  papas: "potato",
  patata: "potato",
  batata: "sweet potato",
  boniato: "sweet potato",
  brocoli: "broccoli",
  brócoli: "broccoli",
  coliflor: "cauliflower",
  repollo: "cabbage",
  col: "cabbage",

  // ARGENTINISMOS (CRÍTICO para matching)
  palta: "avocado",
  choclo: "corn",
  zapallo: "pumpkin",
  morron: "bell pepper",
  morrón: "bell pepper",
  pimiento: "bell pepper",
  aji: "chili pepper",
  ajíes: "chili pepper",
  arveja: "peas",
  arvejas: "peas",
  guisantes: "peas",
  poroto: "beans",
  chaucha: "green beans",
  "judias verdes": "green beans",
  berenjena: "eggplant",
  acelga: "chard",
  remolacha: "beet",
  betabel: "beet",
  apio: "celery",
  rabanito: "radish",

  // FRUTAS
  manzana: "apple",
  manzanas: "apple",
  banana: "banana",
  bananas: "banana",
  platano: "banana",
  limon: "lemon",
  limón: "lemon",
  naranja: "orange",
  naranjas: "orange",
  frutilla: "strawberry",
  frutillas: "strawberry",
  fresa: "strawberry",
  durazno: "peach",
  melocoton: "peach",
  pera: "pear",
  uva: "grape",
  uvas: "grape",
  sandia: "watermelon",
  sandía: "watermelon",
  melon: "melon",
  melón: "melon",
  kiwi: "kiwi",
  mango: "mango",
  piña: "pineapple",
  ananá: "pineapple",

  // ACEITES Y GRASAS
  aceite: "oil",
  "aceite de oliva": "olive oil",
  "aceite de girasol": "sunflower oil",
  "aceite vegetal": "vegetable oil",
  oliva: "olive",
  aceitunas: "olive",

  // ESPECIAS Y CONDIMENTOS
  sal: "salt",
  pimienta: "black pepper",
  "pimienta negra": "black pepper",
  oregano: "oregano",
  orégano: "oregano",
  perejil: "parsley",
  albahaca: "basil",
  cilantro: "cilantro",
  comino: "cumin",
  pimenton: "paprika",
  pimentón: "paprika",
  curry: "curry",
  jengibre: "ginger",
  canela: "cinnamon",
  "nuez moscada": "nutmeg",

  // FRUTOS SECOS Y SEMILLAS
  nuez: "walnut",
  nueces: "walnut",
  almendra: "almond",
  almendras: "almond",
  mani: "peanut",
  maní: "peanut",
  cacahuate: "peanut",
  "semillas de chia": "chia seeds",
  chia: "chia seeds",
  "semillas de sesamo": "sesame seeds",
  ajonjoli: "sesame seeds",

  // OTROS
  azúcar: "sugar",
  azucar: "sugar",
  "azúcar blanca": "white sugar",
  "azúcar morena": "brown sugar",
  miel: "honey",
  chocolate: "chocolate",
  cacao: "cocoa",
  vino: "wine",
  "vino blanco": "white wine",
  "vino tinto": "red wine",
  levadura: "yeast",
  vinagre: "vinegar",
  mostaza: "mustard",
  mayonesa: "mayonnaise",
  ketchup: "ketchup",
  "salsa de tomate": "tomato sauce",
};

/**
 * Traduce un nombre de ingrediente de español a inglés
 * Usa diccionario + búsqueda parcial por palabras
 */
export const translateToEnglish = (spanishName: string): string => {
  const normalized = spanishName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .trim();

  // 1. Traducción exacta
  if (translations[normalized]) {
    console.log(`Traducido: "${spanishName}" → "${translations[normalized]}"`);
    return translations[normalized];
  }

  // 2. Búsqueda parcial (por palabras)
  for (const [spanish, english] of Object.entries(translations)) {
    if (normalized.includes(spanish) || spanish.includes(normalized)) {
      console.log(`Traducido (parcial): "${spanishName}" → "${english}"`);
      return english;
    }
  }

  // 3. Devolver original (puede funcionar para palabras internacionales)
  console.warn(`Sin traducción para: "${spanishName}" (usando original)`);
  return spanishName;
};

/**
 * Carga el JSON de USDA en memoria (singleton)
 * Solo se ejecuta una vez durante la sesión
 */
export const loadUSDALocalData = (): any[] => {
  if (!localFoodsCache) {
    try {
      console.log("Cargando JSON local de USDA Foundation Foods...");

      // Importar el archivo JSON directamente
      const foodDataJson = require("../../FoodData_Central_foundation_food_json_2025-04-24.json");

      if (!foodDataJson || !foodDataJson.FoundationFoods) {
        console.error("Error: JSON no tiene la estructura esperada");
        return [];
      }

      localFoodsCache = foodDataJson.FoundationFoods;
      console.log(
        `${localFoodsCache?.length || 0} alimentos cargados en memoria`
      );
    } catch (error) {
      console.error("Error al cargar JSON local de USDA:", error);
      return [];
    }
  }

  return localFoodsCache || [];
};

/**
 * Parsea un alimento del JSON de USDA y lo convierte a NutritionData
 * Mapea los IDs de nutrientes de USDA a nuestros campos
 */
const parseUSDAJsonFood = (food: any, originalName: string): NutritionData => {
  // Crear mapa de nutrientes por ID para acceso rápido
  const nutrientMap: { [key: number]: number } = {};

  if (food.foodNutrients && Array.isArray(food.foodNutrients)) {
    food.foodNutrients.forEach((nutrient: any) => {
      if (
        nutrient.nutrient &&
        nutrient.nutrient.id &&
        nutrient.amount !== undefined
      ) {
        nutrientMap[nutrient.nutrient.id] = nutrient.amount;
      }
    });
  }

  // IDs de nutrientes USDA FoodData Central:
  // 1008 = Energy (kcal)
  // 1003 = Protein
  // 1005 = Carbohydrate, by difference
  // 1004 = Total lipid (fat)
  // 1079 = Fiber, total dietary
  // 2000 = Sugars, total (puede variar, buscar el total)
  // 1093 = Sodium, Na
  // 1106 = Vitamin A, RAE
  // 1162 = Vitamin C, total ascorbic acid
  // 1087 = Calcium, Ca
  // 1089 = Iron, Fe

  // Para vitaminas, necesitamos convertir de cantidad absoluta a % Valor Diario (DV)
  // DV estándar (FDA):
  // - Vitamin A: 900 µg RAE
  // - Vitamin C: 90 mg
  // - Calcium: 1300 mg
  // - Iron: 18 mg

  const vitaminA_ug = nutrientMap[1106] || 0; // µg RAE
  const vitaminC_mg = nutrientMap[1162] || 0; // mg
  const calcium_mg = nutrientMap[1087] || 0; // mg
  const iron_mg = nutrientMap[1089] || 0; // mg

  // Buscar azúcares totales (puede estar en varios IDs)
  const sugar_g = nutrientMap[2000] || nutrientMap[1063] || 0;

  const nutritionData: NutritionData = {
    ingredient_name: originalName.toLowerCase(),
    serving_size_g: 100, // USDA siempre usa 100g como base
    calories: Math.round(nutrientMap[1008] || 0),
    protein_g: Math.round((nutrientMap[1003] || 0) * 10) / 10,
    carbs_g: Math.round((nutrientMap[1005] || 0) * 10) / 10,
    fat_g: Math.round((nutrientMap[1004] || 0) * 10) / 10,
    fiber_g: Math.round((nutrientMap[1079] || 0) * 10) / 10,
    sugar_g: Math.round(sugar_g * 10) / 10,
    sodium_mg: Math.round(nutrientMap[1093] || 0),

    // Convertir a % Valor Diario
    vitamin_a_dv: Math.round((vitaminA_ug / 900) * 100),
    vitamin_c_dv: Math.round((vitaminC_mg / 90) * 100),
    calcium_dv: Math.round((calcium_mg / 1300) * 100),
    iron_dv: Math.round((iron_mg / 18) * 100),

    category: "usda_foundation",
  };

  console.log(
    `Parseado "${food.description}": ${nutritionData.calories} cal, ` +
      `${nutritionData.protein_g}g prot, ${nutritionData.carbs_g}g carbs, ${nutritionData.fat_g}g fat`
  );

  return nutritionData;
};

export const searchInLocalUSDA = (
  ingredientName: string
): NutritionData | null => {
  const foods = loadUSDALocalData();

  if (!foods || foods.length === 0) {
    console.warn("No se pudo cargar el JSON de USDA");
    return null;
  }

  // Traducir español → inglés
  const englishName = translateToEnglish(ingredientName);
  const query = englishName.toLowerCase().trim();

  console.log(
    `📂 Buscando "${ingredientName}" (traducido: "${englishName}") en ${foods.length} alimentos...`
  );

  let food = foods.find((f: any) => {
    const desc = f.description?.toLowerCase() || "";
    return desc === query;
  });

  if (food) {
    console.log(`Coincidencia exacta: "${food.description}"`);
    return parseUSDAJsonFood(food, ingredientName);
  }

  food = foods.find((f: any) => {
    const desc = f.description?.toLowerCase() || "";
    return desc.includes(query);
  });

  if (food) {
    console.log(`Coincidencia parcial: "${food.description}"`);
    return parseUSDAJsonFood(food, ingredientName);
  }

  food = foods.find((f: any) => {
    const desc = f.description?.toLowerCase() || "";
    return query.includes(desc) && desc.length > 3;
  });

  if (food) {
    console.log(`Coincidencia inversa: "${food.description}"`);
    return parseUSDAJsonFood(food, ingredientName);
  }

  const queryWords = query.split(/\s+/).filter((w: string) => w.length > 2);
  food = foods.find((f: any) => {
    const desc = f.description?.toLowerCase() || "";
    const descWords = desc.split(/\s+/);

    return queryWords.some((qw: string) =>
      descWords.some((dw: string) => dw.includes(qw) || qw.includes(dw))
    );
  });

  if (food) {
    console.log(`Coincidencia por palabras: "${food.description}"`);
    return parseUSDAJsonFood(food, ingredientName);
  }

  console.warn(`No se encontró "${ingredientName}" en JSON local`);
  return null;
};
