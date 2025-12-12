import * as SQLite from "expo-sqlite";
import { NutritionData, UnitConversion } from "../types";

const DATABASE_NAME = "Saz-nly.db";
const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Inicializar tablas de nutrición
export const initNutritionTables = () => {
  try {
    // Tabla de datos nutricionales (por 100g)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS nutrition_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_name TEXT NOT NULL UNIQUE,
        spanish_name TEXT,
        serving_size_g REAL NOT NULL DEFAULT 100,
        calories REAL NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fat_g REAL NOT NULL,
        fiber_g REAL DEFAULT 0,
        sugar_g REAL DEFAULT 0,
        sodium_mg REAL DEFAULT 0,
        vitamin_a_dv REAL DEFAULT 0,
        vitamin_c_dv REAL DEFAULT 0,
        calcium_dv REAL DEFAULT 0,
        iron_dv REAL DEFAULT 0,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de conversiones de unidades
    db.execSync(`
      CREATE TABLE IF NOT EXISTS unit_conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_name TEXT NOT NULL,
        ingredient_category TEXT,
        grams_per_unit REAL NOT NULL,
        notes TEXT
      );
    `);

    // Índices para búsquedas rápidas
    try {
      db.execSync(
        "CREATE INDEX IF NOT EXISTS idx_nutrition_ingredient ON nutrition_data(ingredient_name)"
      );
      db.execSync(
        "CREATE INDEX IF NOT EXISTS idx_nutrition_spanish ON nutrition_data(spanish_name)"
      );
      db.execSync(
        "CREATE INDEX IF NOT EXISTS idx_unit_conversion_unit ON unit_conversions(unit_name)"
      );
    } catch (error) {
      // Los índices ya existen, ignorar
    }

    console.log("Tablas de nutrición inicializadas correctamente");
  } catch (error) {
    console.error("Error al inicializar tablas de nutrición:", error);
    throw error;
  }
};

// Sembrar datos nutricionales
export const seedNutritionData = () => {
  try {
    // Verificar si ya hay datos
    const count = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM nutrition_data"
    );
    if (count && count.count > 0) {
      console.log("Datos nutricionales ya existen, omitiendo seed");
      return;
    }

    const nutritionData: Omit<NutritionData, "id">[] = [
      // Proteínas
      {
        ingredient_name: "carne picada",
        serving_size_g: 100,
        calories: 250,
        protein_g: 26,
        carbs_g: 0,
        fat_g: 15,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 75,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 2,
        iron_dv: 15,
        category: "protein",
      },
      {
        ingredient_name: "carne molida",
        serving_size_g: 100,
        calories: 250,
        protein_g: 26,
        carbs_g: 0,
        fat_g: 15,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 75,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 2,
        iron_dv: 15,
        category: "protein",
      },
      {
        ingredient_name: "carne de res",
        serving_size_g: 100,
        calories: 250,
        protein_g: 26,
        carbs_g: 0,
        fat_g: 15,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 75,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 2,
        iron_dv: 20,
        category: "protein",
      },
      {
        ingredient_name: "huevo",
        serving_size_g: 100,
        calories: 155,
        protein_g: 13,
        carbs_g: 1.1,
        fat_g: 11,
        fiber_g: 0,
        sugar_g: 1.1,
        sodium_mg: 124,
        vitamin_a_dv: 10,
        vitamin_c_dv: 0,
        calcium_dv: 5,
        iron_dv: 6,
        category: "protein",
      },
      {
        ingredient_name: "garbanzos",
        serving_size_g: 100,
        calories: 364,
        protein_g: 19,
        carbs_g: 61,
        fat_g: 6,
        fiber_g: 17,
        sugar_g: 11,
        sodium_mg: 24,
        vitamin_a_dv: 1,
        vitamin_c_dv: 7,
        calcium_dv: 5,
        iron_dv: 30,
        category: "protein",
      },
      {
        ingredient_name: "pollo",
        serving_size_g: 100,
        calories: 239,
        protein_g: 27,
        carbs_g: 0,
        fat_g: 14,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 82,
        vitamin_a_dv: 1,
        vitamin_c_dv: 0,
        calcium_dv: 1,
        iron_dv: 5,
        category: "protein",
      },

      // Granos
      {
        ingredient_name: "pasta",
        serving_size_g: 100,
        calories: 371,
        protein_g: 13,
        carbs_g: 75,
        fat_g: 1.5,
        fiber_g: 3,
        sugar_g: 2.7,
        sodium_mg: 6,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 2,
        iron_dv: 10,
        category: "grain",
      },
      {
        ingredient_name: "quinoa",
        serving_size_g: 100,
        calories: 368,
        protein_g: 14,
        carbs_g: 64,
        fat_g: 6,
        fiber_g: 7,
        sugar_g: 0,
        sodium_mg: 5,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 5,
        iron_dv: 25,
        category: "grain",
      },
      {
        ingredient_name: "arroz",
        serving_size_g: 100,
        calories: 130,
        protein_g: 2.7,
        carbs_g: 28,
        fat_g: 0.3,
        fiber_g: 0.4,
        sugar_g: 0.1,
        sodium_mg: 1,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 1,
        iron_dv: 1,
        category: "grain",
      },
      {
        ingredient_name: "harina",
        serving_size_g: 100,
        calories: 364,
        protein_g: 10,
        carbs_g: 76,
        fat_g: 1,
        fiber_g: 2.7,
        sugar_g: 0.3,
        sodium_mg: 2,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 2,
        iron_dv: 20,
        category: "grain",
      },
      {
        ingredient_name: "pan rallado",
        serving_size_g: 100,
        calories: 395,
        protein_g: 13,
        carbs_g: 72,
        fat_g: 5,
        fiber_g: 4,
        sugar_g: 6,
        sodium_mg: 732,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 14,
        iron_dv: 18,
        category: "grain",
      },

      // Lácteos
      {
        ingredient_name: "queso parmesano",
        serving_size_g: 100,
        calories: 431,
        protein_g: 38,
        carbs_g: 4,
        fat_g: 29,
        fiber_g: 0,
        sugar_g: 0.9,
        sodium_mg: 1602,
        vitamin_a_dv: 10,
        vitamin_c_dv: 0,
        calcium_dv: 110,
        iron_dv: 3,
        category: "dairy",
      },
      {
        ingredient_name: "parmesano",
        serving_size_g: 100,
        calories: 431,
        protein_g: 38,
        carbs_g: 4,
        fat_g: 29,
        fiber_g: 0,
        sugar_g: 0.9,
        sodium_mg: 1602,
        vitamin_a_dv: 10,
        vitamin_c_dv: 0,
        calcium_dv: 110,
        iron_dv: 3,
        category: "dairy",
      },
      {
        ingredient_name: "mozzarella",
        serving_size_g: 100,
        calories: 280,
        protein_g: 28,
        carbs_g: 3,
        fat_g: 17,
        fiber_g: 0,
        sugar_g: 1,
        sodium_mg: 627,
        vitamin_a_dv: 8,
        vitamin_c_dv: 0,
        calcium_dv: 50,
        iron_dv: 2,
        category: "dairy",
      },
      {
        ingredient_name: "queso",
        serving_size_g: 100,
        calories: 350,
        protein_g: 25,
        carbs_g: 2,
        fat_g: 27,
        fiber_g: 0,
        sugar_g: 1,
        sodium_mg: 700,
        vitamin_a_dv: 15,
        vitamin_c_dv: 0,
        calcium_dv: 70,
        iron_dv: 2,
        category: "dairy",
      },
      {
        ingredient_name: "leche",
        serving_size_g: 100,
        calories: 61,
        protein_g: 3.2,
        carbs_g: 4.8,
        fat_g: 3.3,
        fiber_g: 0,
        sugar_g: 5.1,
        sodium_mg: 44,
        vitamin_a_dv: 5,
        vitamin_c_dv: 0,
        calcium_dv: 12,
        iron_dv: 0,
        category: "dairy",
      },
      {
        ingredient_name: "manteca",
        serving_size_g: 100,
        calories: 717,
        protein_g: 0.9,
        carbs_g: 0.1,
        fat_g: 81,
        fiber_g: 0,
        sugar_g: 0.1,
        sodium_mg: 11,
        vitamin_a_dv: 50,
        vitamin_c_dv: 0,
        calcium_dv: 2,
        iron_dv: 0,
        category: "dairy",
      },
      {
        ingredient_name: "crema de leche",
        serving_size_g: 100,
        calories: 345,
        protein_g: 2.1,
        carbs_g: 2.8,
        fat_g: 37,
        fiber_g: 0,
        sugar_g: 2.8,
        sodium_mg: 38,
        vitamin_a_dv: 35,
        vitamin_c_dv: 1,
        calcium_dv: 7,
        iron_dv: 0,
        category: "dairy",
      },

      // Vegetales
      {
        ingredient_name: "tomate",
        serving_size_g: 100,
        calories: 18,
        protein_g: 0.9,
        carbs_g: 3.9,
        fat_g: 0.2,
        fiber_g: 1.2,
        sugar_g: 2.6,
        sodium_mg: 5,
        vitamin_a_dv: 17,
        vitamin_c_dv: 23,
        calcium_dv: 1,
        iron_dv: 1,
        category: "vegetable",
      },
      {
        ingredient_name: "cebolla",
        serving_size_g: 100,
        calories: 40,
        protein_g: 1.1,
        carbs_g: 9,
        fat_g: 0.1,
        fiber_g: 1.7,
        sugar_g: 4.2,
        sodium_mg: 4,
        vitamin_a_dv: 0,
        vitamin_c_dv: 12,
        calcium_dv: 2,
        iron_dv: 1,
        category: "vegetable",
      },
      {
        ingredient_name: "espinaca",
        serving_size_g: 100,
        calories: 23,
        protein_g: 2.9,
        carbs_g: 3.6,
        fat_g: 0.4,
        fiber_g: 2.2,
        sugar_g: 0.4,
        sodium_mg: 79,
        vitamin_a_dv: 188,
        vitamin_c_dv: 47,
        calcium_dv: 10,
        iron_dv: 15,
        category: "vegetable",
      },
      {
        ingredient_name: "aguacate",
        serving_size_g: 100,
        calories: 160,
        protein_g: 2,
        carbs_g: 8.5,
        fat_g: 15,
        fiber_g: 6.7,
        sugar_g: 0.7,
        sodium_mg: 7,
        vitamin_a_dv: 3,
        vitamin_c_dv: 17,
        calcium_dv: 1,
        iron_dv: 3,
        category: "vegetable",
      },
      {
        ingredient_name: "lechuga",
        serving_size_g: 100,
        calories: 15,
        protein_g: 1.4,
        carbs_g: 2.9,
        fat_g: 0.2,
        fiber_g: 1.3,
        sugar_g: 0.8,
        sodium_mg: 28,
        vitamin_a_dv: 148,
        vitamin_c_dv: 15,
        calcium_dv: 4,
        iron_dv: 5,
        category: "vegetable",
      },
      {
        ingredient_name: "pepino",
        serving_size_g: 100,
        calories: 16,
        protein_g: 0.7,
        carbs_g: 3.6,
        fat_g: 0.1,
        fiber_g: 0.5,
        sugar_g: 1.7,
        sodium_mg: 2,
        vitamin_a_dv: 2,
        vitamin_c_dv: 5,
        calcium_dv: 2,
        iron_dv: 2,
        category: "vegetable",
      },
      {
        ingredient_name: "ajo",
        serving_size_g: 100,
        calories: 149,
        protein_g: 6.4,
        carbs_g: 33,
        fat_g: 0.5,
        fiber_g: 2.1,
        sugar_g: 1,
        sodium_mg: 17,
        vitamin_a_dv: 0,
        vitamin_c_dv: 52,
        calcium_dv: 18,
        iron_dv: 9,
        category: "vegetable",
      },
      {
        ingredient_name: "zanahoria",
        serving_size_g: 100,
        calories: 41,
        protein_g: 0.9,
        carbs_g: 10,
        fat_g: 0.2,
        fiber_g: 2.8,
        sugar_g: 4.7,
        sodium_mg: 69,
        vitamin_a_dv: 334,
        vitamin_c_dv: 10,
        calcium_dv: 3,
        iron_dv: 2,
        category: "vegetable",
      },

      // Grasas y aceites
      {
        ingredient_name: "aceite de oliva",
        serving_size_g: 100,
        calories: 884,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 100,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 2,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 0,
        iron_dv: 2,
        category: "fat",
      },
      {
        ingredient_name: "aceite",
        serving_size_g: 100,
        calories: 884,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 100,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 0,
        iron_dv: 0,
        category: "fat",
      },

      // Azúcares y endulzantes
      {
        ingredient_name: "azúcar",
        serving_size_g: 100,
        calories: 387,
        protein_g: 0,
        carbs_g: 100,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 100,
        sodium_mg: 1,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 0,
        iron_dv: 0,
        category: "sugar",
      },
      {
        ingredient_name: "miel",
        serving_size_g: 100,
        calories: 304,
        protein_g: 0.3,
        carbs_g: 82,
        fat_g: 0,
        fiber_g: 0.2,
        sugar_g: 82,
        sodium_mg: 4,
        vitamin_a_dv: 0,
        vitamin_c_dv: 1,
        calcium_dv: 1,
        iron_dv: 2,
        category: "sugar",
      },

      // Especias y condimentos
      {
        ingredient_name: "sal",
        serving_size_g: 100,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 38758,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 0,
        iron_dv: 0,
        category: "spice",
      },
      {
        ingredient_name: "pimienta",
        serving_size_g: 100,
        calories: 251,
        protein_g: 10,
        carbs_g: 64,
        fat_g: 3,
        fiber_g: 26,
        sugar_g: 0.6,
        sodium_mg: 20,
        vitamin_a_dv: 3,
        vitamin_c_dv: 0,
        calcium_dv: 44,
        iron_dv: 52,
        category: "spice",
      },
      {
        ingredient_name: "oregano",
        serving_size_g: 100,
        calories: 265,
        protein_g: 9,
        carbs_g: 69,
        fat_g: 4,
        fiber_g: 43,
        sugar_g: 4,
        sodium_mg: 25,
        vitamin_a_dv: 34,
        vitamin_c_dv: 4,
        calcium_dv: 160,
        iron_dv: 205,
        category: "spice",
      },
      {
        ingredient_name: "perejil",
        serving_size_g: 100,
        calories: 36,
        protein_g: 3,
        carbs_g: 6,
        fat_g: 0.8,
        fiber_g: 3.3,
        sugar_g: 0.9,
        sodium_mg: 56,
        vitamin_a_dv: 168,
        vitamin_c_dv: 220,
        calcium_dv: 14,
        iron_dv: 34,
        category: "spice",
      },
      {
        ingredient_name: "albahaca",
        serving_size_g: 100,
        calories: 23,
        protein_g: 3.2,
        carbs_g: 2.7,
        fat_g: 0.6,
        fiber_g: 1.6,
        sugar_g: 0.3,
        sodium_mg: 4,
        vitamin_a_dv: 56,
        vitamin_c_dv: 30,
        calcium_dv: 18,
        iron_dv: 18,
        category: "spice",
      },
      {
        ingredient_name: "limon",
        serving_size_g: 100,
        calories: 29,
        protein_g: 1.1,
        carbs_g: 9,
        fat_g: 0.3,
        fiber_g: 2.8,
        sugar_g: 2.5,
        sodium_mg: 2,
        vitamin_a_dv: 0,
        vitamin_c_dv: 88,
        calcium_dv: 3,
        iron_dv: 3,
        category: "fruit",
      },
      {
        ingredient_name: "vino blanco",
        serving_size_g: 100,
        calories: 82,
        protein_g: 0.1,
        carbs_g: 2.6,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 1.4,
        sodium_mg: 5,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 1,
        iron_dv: 2,
        category: "liquid",
      },
      {
        ingredient_name: "levadura",
        serving_size_g: 100,
        calories: 325,
        protein_g: 41,
        carbs_g: 42,
        fat_g: 7,
        fiber_g: 27,
        sugar_g: 0,
        sodium_mg: 51,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        calcium_dv: 3,
        iron_dv: 28,
        category: "other",
      },
    ];

    // Insertar datos
    const stmt = db.prepareSync(`
      INSERT INTO nutrition_data (
        ingredient_name, serving_size_g, calories, protein_g, carbs_g, fat_g,
        fiber_g, sugar_g, sodium_mg, vitamin_a_dv, vitamin_c_dv, calcium_dv, iron_dv, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of nutritionData) {
      stmt.executeSync([
        item.ingredient_name,
        item.serving_size_g,
        item.calories,
        item.protein_g,
        item.carbs_g,
        item.fat_g,
        item.fiber_g,
        item.sugar_g,
        item.sodium_mg,
        item.vitamin_a_dv,
        item.vitamin_c_dv,
        item.calcium_dv,
        item.iron_dv,
        item.category || null,
      ]);
    }

    console.log(
      `✅ ${nutritionData.length} ingredientes nutricionales sembrados correctamente`
    );
  } catch (error) {
    console.error("Error al sembrar datos nutricionales:", error);
    throw error;
  }
};

// Sembrar conversiones de unidades
export const seedUnitConversions = () => {
  try {
    // Verificar si ya hay datos
    const count = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM unit_conversions"
    );
    if (count && count.count > 0) {
      console.log("Conversiones de unidades ya existen, omitiendo seed");
      return;
    }

    const conversions: Omit<UnitConversion, "id">[] = [
      // Pesos directos
      { unit_name: "g", ingredient_category: "any", grams_per_unit: 1 },
      { unit_name: "kg", ingredient_category: "any", grams_per_unit: 1000 },

      // Volumen - Líquidos
      { unit_name: "ml", ingredient_category: "liquid", grams_per_unit: 1 },
      { unit_name: "l", ingredient_category: "liquid", grams_per_unit: 1000 },
      { unit_name: "taza", ingredient_category: "liquid", grams_per_unit: 240 },
      {
        unit_name: "cucharada",
        ingredient_category: "liquid",
        grams_per_unit: 15,
      },
      {
        unit_name: "cucharadita",
        ingredient_category: "liquid",
        grams_per_unit: 5,
      },

      // Volumen - Harina
      { unit_name: "taza", ingredient_category: "flour", grams_per_unit: 120 },
      {
        unit_name: "cucharada",
        ingredient_category: "flour",
        grams_per_unit: 8,
      },

      // Volumen - Azúcar
      { unit_name: "taza", ingredient_category: "sugar", grams_per_unit: 200 },
      {
        unit_name: "cucharada",
        ingredient_category: "sugar",
        grams_per_unit: 12,
      },

      // Volumen - Granos (arroz, quinoa)
      { unit_name: "taza", ingredient_category: "grain", grams_per_unit: 185 },

      // Unidades - Proteínas
      { unit_name: "unidad", ingredient_category: "egg", grams_per_unit: 50 },

      // Unidades - Vegetales y Frutas
      { unit_name: "unidad", ingredient_category: "avocado", grams_per_unit: 150 },
      { unit_name: "unidad", ingredient_category: "lemon", grams_per_unit: 58 },
      { unit_name: "unidad", ingredient_category: "lime", grams_per_unit: 67 },
      { unit_name: "unidad", ingredient_category: "onion", grams_per_unit: 150 },
      { unit_name: "unidad", ingredient_category: "tomato", grams_per_unit: 123 },
      { unit_name: "unidad", ingredient_category: "potato", grams_per_unit: 173 },
      { unit_name: "unidad", ingredient_category: "apple", grams_per_unit: 182 },
      { unit_name: "unidad", ingredient_category: "banana", grams_per_unit: 118 },
      { unit_name: "unidad", ingredient_category: "orange", grams_per_unit: 131 },
      { unit_name: "unidad", ingredient_category: "carrot", grams_per_unit: 61 },
      { unit_name: "unidad", ingredient_category: "bell_pepper", grams_per_unit: 119 },

      // Unidades - Otros
      { unit_name: "diente", ingredient_category: "garlic", grams_per_unit: 3 },

      // Cucharadas genéricas (aceite, manteca)
      {
        unit_name: "cucharada",
        ingredient_category: "fat",
        grams_per_unit: 14,
      },
    ];

    const stmt = db.prepareSync(`
      INSERT INTO unit_conversions (unit_name, ingredient_category, grams_per_unit)
      VALUES (?, ?, ?)
    `);

    for (const conv of conversions) {
      stmt.executeSync([
        conv.unit_name,
        conv.ingredient_category || null,
        conv.grams_per_unit,
      ]);
    }

    console.log(
      `✅ ${conversions.length} conversiones de unidades sembradas correctamente`
    );
  } catch (error) {
    console.error("Error al sembrar conversiones de unidades:", error);
    throw error;
  }
};

// Obtener datos nutricionales por nombre de ingrediente
export const getNutritionForIngredient = (
  ingredientName: string
): NutritionData | null => {
  try {
    const normalized = ingredientName.toLowerCase().trim();

    // 1. Buscar coincidencia exacta en español
    let result = db.getFirstSync<NutritionData>(
      "SELECT * FROM nutrition_data WHERE LOWER(spanish_name) = ?",
      [normalized]
    );
    if (result) return result;

    // 2. Buscar coincidencia exacta en inglés
    result = db.getFirstSync<NutritionData>(
      "SELECT * FROM nutrition_data WHERE LOWER(ingredient_name) = ?",
      [normalized]
    );
    if (result) return result;

    // 3. Buscar coincidencia parcial en español
    result = db.getFirstSync<NutritionData>(
      "SELECT * FROM nutrition_data WHERE LOWER(spanish_name) LIKE ? LIMIT 1",
      [`%${normalized}%`]
    );
    if (result) return result;

    // 4. Buscar coincidencia parcial en inglés
    result = db.getFirstSync<NutritionData>(
      "SELECT * FROM nutrition_data WHERE LOWER(ingredient_name) LIKE ? LIMIT 1",
      [`%${normalized}%`]
    );

    return result || null;
  } catch (error) {
    console.error("Error al buscar datos nutricionales:", error);
    return null;
  }
};

// Obtener conversión de unidad
export const getUnitConversion = (
  unitName: string,
  category?: string
): UnitConversion | null => {
  try {
    const normalized = unitName.toLowerCase().trim();

    // Buscar con categoría específica primero
    if (category) {
      const result = db.getFirstSync<UnitConversion>(
        "SELECT * FROM unit_conversions WHERE LOWER(unit_name) = ? AND ingredient_category = ?",
        [normalized, category]
      );
      if (result) return result;
    }

    // Buscar sin categoría o con categoría 'any'
    const result = db.getFirstSync<UnitConversion>(
      "SELECT * FROM unit_conversions WHERE LOWER(unit_name) = ? AND (ingredient_category IS NULL OR ingredient_category = 'any') LIMIT 1",
      [normalized]
    );

    return result || null;
  } catch (error) {
    console.error("Error al buscar conversión de unidad:", error);
    return null;
  }
};

// Obtener todos los datos nutricionales (para caching)
export const getAllNutritionData = (): NutritionData[] => {
  try {
    const result = db.getAllSync<NutritionData>("SELECT * FROM nutrition_data");
    return result;
  } catch (error) {
    console.error("Error al obtener todos los datos nutricionales:", error);
    return [];
  }
};

// Agregar un nuevo ingrediente a la base de datos
export const addNutritionData = (
  data: Omit<NutritionData, "id">,
  spanishName?: string
): boolean => {
  try {
    // Verificar si ya existe
    const existing = db.getFirstSync<NutritionData>(
      "SELECT * FROM nutrition_data WHERE LOWER(ingredient_name) = ?",
      [data.ingredient_name.toLowerCase()]
    );

    if (existing) {
      console.log(
        `✓ Ingrediente "${data.ingredient_name}" ya existe en BD, omitiendo inserción`
      );
      return false;
    }

    // Insertar nuevo ingrediente
    db.runSync(
      `INSERT INTO nutrition_data (
        ingredient_name, spanish_name, serving_size_g, calories, protein_g, carbs_g, fat_g,
        fiber_g, sugar_g, sodium_mg, vitamin_a_dv, vitamin_c_dv, calcium_dv, iron_dv, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.ingredient_name,
        spanishName || null,
        data.serving_size_g,
        data.calories,
        data.protein_g,
        data.carbs_g,
        data.fat_g,
        data.fiber_g,
        data.sugar_g,
        data.sodium_mg,
        data.vitamin_a_dv,
        data.vitamin_c_dv,
        data.calcium_dv,
        data.iron_dv,
        data.category || null,
      ]
    );

    console.log(
      `✅ Ingrediente "${data.ingredient_name}" agregado a BD con éxito`
    );
    return true;
  } catch (error) {
    console.error(
      `Error al agregar ingrediente "${data.ingredient_name}":`,
      error
    );
    return false;
  }
};

// Actualizar conversiones de unidades (agregar las faltantes sin borrar)
export const updateUnitConversions = () => {
  try {
    console.log("Actualizando conversiones de unidades...");

    const newConversions: Omit<UnitConversion, "id">[] = [
      // Unidades - Vegetales y Frutas
      { unit_name: "unidad", ingredient_category: "avocado", grams_per_unit: 150 },
      { unit_name: "unidad", ingredient_category: "lemon", grams_per_unit: 58 },
      { unit_name: "unidad", ingredient_category: "lime", grams_per_unit: 67 },
      { unit_name: "unidad", ingredient_category: "onion", grams_per_unit: 150 },
      { unit_name: "unidad", ingredient_category: "tomato", grams_per_unit: 123 },
      { unit_name: "unidad", ingredient_category: "potato", grams_per_unit: 173 },
      { unit_name: "unidad", ingredient_category: "apple", grams_per_unit: 182 },
      { unit_name: "unidad", ingredient_category: "banana", grams_per_unit: 118 },
      { unit_name: "unidad", ingredient_category: "orange", grams_per_unit: 131 },
      { unit_name: "unidad", ingredient_category: "carrot", grams_per_unit: 61 },
      { unit_name: "unidad", ingredient_category: "bell_pepper", grams_per_unit: 119 },
    ];

    let insertedCount = 0;
    const stmt = db.prepareSync(`
      INSERT OR IGNORE INTO unit_conversions (unit_name, ingredient_category, grams_per_unit)
      VALUES (?, ?, ?)
    `);

    for (const conv of newConversions) {
      try {
        stmt.executeSync([
          conv.unit_name,
          conv.ingredient_category || null,
          conv.grams_per_unit,
        ]);
        insertedCount++;
      } catch (error) {
        // Ignorar duplicados
      }
    }

    console.log(
      `✅ ${insertedCount} conversiones de unidades actualizadas`
    );
  } catch (error) {
    console.error("Error al actualizar conversiones de unidades:", error);
  }
};

// Cargar 340 ingredientes USDA desde JSON
export const seedUSDAIngredients = () => {
  try {
    // Verificar si ya fueron cargados
    const count = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM nutrition_data WHERE category = 'usda_foundation'"
    );

    // Si hay datos pero son menos de 300, hubo un error previo, recargar
    if (count && count.count >= 300) {
      console.log(`Ingredientes USDA ya cargados: ${count.count} ingredientes`);
      return;
    }

    if (count && count.count > 0 && count.count < 300) {
      console.log(`⚠️ Solo hay ${count.count} ingredientes USDA, recargando todos...`);
      // Limpiar ingredientes USDA incompletos
      db.execSync("DELETE FROM nutrition_data WHERE category = 'usda_foundation'");
    }

    console.log("Cargando 340 ingredientes USDA desde JSON...");

    // Cargar datos USDA
    const usdaData = require("../data/usdaIngredients.json") as Omit<
      NutritionData,
      "id"
    >[];

    console.log(`📥 JSON cargado: ${usdaData.length} ingredientes`);

    // Cargar traducciones
    const translations = require("../data/ingredientTranslations.json") as {
      [spanish: string]: string;
    };

    // Crear mapa inverso: inglés -> español
    const reverseTranslations: { [english: string]: string } = {};
    for (const [spanish, english] of Object.entries(translations)) {
      reverseTranslations[english] = spanish;
    }
    console.log(`🌍 Traducciones cargadas: ${Object.keys(translations).length} español→inglés, ${Object.keys(reverseTranslations).length} inglés→español`);

    let insertedCount = 0;
    const stmt = db.prepareSync(`
      INSERT INTO nutrition_data (
        ingredient_name, spanish_name, serving_size_g, calories, protein_g, carbs_g, fat_g,
        fiber_g, sugar_g, sodium_mg, vitamin_a_dv, vitamin_c_dv, calcium_dv, iron_dv, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of usdaData) {
      try {
        // Buscar traducción al español
        const spanishName = reverseTranslations[item.ingredient_name] || null;

        stmt.executeSync([
          item.ingredient_name,
          spanishName,
          item.serving_size_g,
          item.calories,
          item.protein_g,
          item.carbs_g,
          item.fat_g,
          item.fiber_g,
          item.sugar_g,
          item.sodium_mg,
          item.vitamin_a_dv,
          item.vitamin_c_dv,
          item.calcium_dv,
          item.iron_dv,
          item.category || "usda_foundation",
        ]);
        insertedCount++;
      } catch (error) {
        console.error(
          `Error al insertar "${item.ingredient_name}":`,
          error
        );
      }
    }

    console.log(
      `✅ ${insertedCount}/${usdaData.length} ingredientes USDA cargados correctamente`
    );

    // Verificar el conteo final
    const finalCount = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM nutrition_data WHERE category = 'usda_foundation'"
    );
    console.log(`📊 Total en BD después de insertar: ${finalCount?.count || 0} ingredientes USDA`);

  } catch (error) {
    console.error("❌ Error al cargar ingredientes USDA:", error);
    throw error;
  }
};
