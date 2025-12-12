import * as SQLite from "expo-sqlite";
import {
  Recipe,
  Ingredient,
  CookingStep,
  Difficulty,
  Category,
} from "../types";
import { initNutritionTables } from "./nutritionDatabase";

const DATABASE_NAME = "Saz-nly.db";

// Abrir o crear la base de datos
const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Inicializar la base de datos con las tablas
export const initDatabase = () => {
  try {
    // Crear tablas
    db.execSync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        prepTimeMinutes INTEGER NOT NULL,
        servings INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        imageUrl TEXT,
        isFavorite INTEGER DEFAULT 0
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipeId INTEGER NOT NULL,
        item TEXT NOT NULL,
        amount TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipeId INTEGER NOT NULL,
        stepNumber INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        timerSeconds INTEGER,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS objectives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stepId INTEGER NOT NULL,
        task TEXT NOT NULL,
        FOREIGN KEY (stepId) REFERENCES steps(id) ON DELETE CASCADE
      );
    `);

    // Tabla de categorías
    db.execSync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Relación muchos-a-muchos entre recetas y categorías
    db.execSync(`
      CREATE TABLE IF NOT EXISTS recipe_categories (
        recipeId INTEGER NOT NULL,
        categoryId INTEGER NOT NULL,
        PRIMARY KEY (recipeId, categoryId),
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);

    // Agregar campo isFeatured si no existe (manejo de migración)
    try {
      db.execSync(
        "ALTER TABLE recipes ADD COLUMN isFeatured INTEGER DEFAULT 0"
      );
    } catch (error: any) {
      // Columna ya existe, ignorar error
      if (!error?.message?.includes("duplicate column name")) {
        console.warn("Advertencia al agregar columna isFeatured:", error);
      }
    }

    // Inicializar tablas de nutrición
    initNutritionTables();

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar base de datos:", error);
    throw error;
  }
};

// Inicializar categorías predefinidas
export const initializeCategories = () => {
  try {
    // Verificar si ya existen categorías
    const existingCategories = db.getAllSync<Category>(
      "SELECT * FROM categories"
    );

    if (existingCategories.length > 0) {
      console.log("Categorías ya inicializadas, saltando...");
      return;
    }

    const categories = [
      { name: "Vegano", icon: "🌱", color: "#16a34a" },
      { name: "Postres", icon: "🍰", color: "#ec4899" },
      { name: "Bebidas", icon: "☕", color: "#0891b2" },
      { name: "Almuerzos", icon: "🍽️", color: "#f97316" },
      { name: "Meriendas", icon: "🥐", color: "#eab308" },
      { name: "Pastelería", icon: "🥖", color: "#a855f7" },
    ];

    categories.forEach((cat) => {
      db.runSync(
        "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
        [cat.name, cat.icon, cat.color]
      );
    });

    console.log("Categorías inicializadas: 6 categorías creadas");
  } catch (error) {
    console.error("Error al inicializar categorías:", error);
    throw error;
  }
};

// Obtener todas las categorías
export const getAllCategories = (): Category[] => {
  try {
    return db.getAllSync<Category>(
      "SELECT * FROM categories ORDER BY name ASC"
    );
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
};

// Obtener categorías de una receta
export const getRecipeCategories = (recipeId: number): Category[] => {
  try {
    return db.getAllSync<Category>(
      `SELECT c.* FROM categories c
       INNER JOIN recipe_categories rc ON c.id = rc.categoryId
       WHERE rc.recipeId = ?
       ORDER BY c.name ASC`,
      [recipeId]
    );
  } catch (error) {
    console.error("Error al obtener categorías de receta:", error);
    return [];
  }
};

// Asignar categoría a receta
export const assignCategoryToRecipe = (
  recipeId: number,
  categoryId: number
): void => {
  try {
    db.runSync(
      "INSERT OR IGNORE INTO recipe_categories (recipeId, categoryId) VALUES (?, ?)",
      [recipeId, categoryId]
    );
  } catch (error) {
    console.error("Error al asignar categoría:", error);
    throw error;
  }
};

// Obtener recetas por categoría
export const getRecipesByCategory = (categoryId: number): Recipe[] => {
  try {
    const recipes = db.getAllSync<any>(
      `SELECT DISTINCT r.* FROM recipes r
       INNER JOIN recipe_categories rc ON r.id = rc.recipeId
       WHERE rc.categoryId = ?
       ORDER BY r.title ASC`,
      [categoryId]
    );

    return recipes.map((recipe) => ({
      ...recipe,
      difficulty: recipe.difficulty as Difficulty,
      isFavorite: Boolean(recipe.isFavorite),
      isFeatured: Boolean(recipe.isFeatured),
      categories: getRecipeCategories(recipe.id),
      ingredients: getIngredientsByRecipeId(recipe.id),
      steps: getStepsByRecipeId(recipe.id),
    }));
  } catch (error) {
    console.error("Error al obtener recetas por categoría:", error);
    return [];
  }
};

// Obtener recetas destacadas
export const getFeaturedRecipes = (): Recipe[] => {
  try {
    const recipes = db.getAllSync<any>(
      "SELECT * FROM recipes WHERE isFeatured = 1 ORDER BY title ASC"
    );

    return recipes.map((recipe) => ({
      ...recipe,
      difficulty: recipe.difficulty as Difficulty,
      isFavorite: Boolean(recipe.isFavorite),
      isFeatured: true,
      categories: getRecipeCategories(recipe.id),
      ingredients: getIngredientsByRecipeId(recipe.id),
      steps: getStepsByRecipeId(recipe.id),
    }));
  } catch (error) {
    console.error("Error al obtener recetas destacadas:", error);
    return [];
  }
};

// Marcar/desmarcar como destacada
export const toggleFeatured = (recipeId: number): boolean => {
  try {
    const recipe = db.getFirstSync<any>(
      "SELECT isFeatured FROM recipes WHERE id = ?",
      [recipeId]
    );

    if (!recipe) return false;

    const newFeaturedStatus = recipe.isFeatured === 1 ? 0 : 1;

    db.runSync("UPDATE recipes SET isFeatured = ? WHERE id = ?", [
      newFeaturedStatus,
      recipeId,
    ]);

    return newFeaturedStatus === 1;
  } catch (error) {
    console.error("Error al cambiar estado destacado:", error);
    return false;
  }
};

// Obtener todas las recetas
export const getAllRecipes = (): Recipe[] => {
  try {
    const recipes = db.getAllSync<any>(
      "SELECT * FROM recipes ORDER BY title ASC"
    );

    return recipes.map((recipe) => ({
      ...recipe,
      difficulty: recipe.difficulty as Difficulty,
      isFavorite: Boolean(recipe.isFavorite),
      isFeatured: Boolean(recipe.isFeatured),
      categories: getRecipeCategories(recipe.id),
      ingredients: getIngredientsByRecipeId(recipe.id),
      steps: getStepsByRecipeId(recipe.id),
    }));
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    return [];
  }
};

// Obtener receta por ID
export const getRecipeById = (id: number): Recipe | null => {
  try {
    const recipe = db.getFirstSync<any>("SELECT * FROM recipes WHERE id = ?", [
      id,
    ]);

    if (!recipe) return null;

    return {
      ...recipe,
      difficulty: recipe.difficulty as Difficulty,
      isFavorite: Boolean(recipe.isFavorite),
      isFeatured: Boolean(recipe.isFeatured),
      categories: getRecipeCategories(recipe.id),
      ingredients: getIngredientsByRecipeId(recipe.id),
      steps: getStepsByRecipeId(recipe.id),
    };
  } catch (error) {
    console.error("Error al obtener receta:", error);
    return null;
  }
};

export const searchRecipes = (query: string): Recipe[] => {
  try {
    const sanitizedQuery = `%${query.toLowerCase()}%`;

    const recipes = db.getAllSync<any>(
      `SELECT * FROM recipes
       WHERE lower(title) LIKE ?
       ORDER BY title ASC`,
      [sanitizedQuery]
    );

    return recipes.map((recipe) => ({
      ...recipe,
      difficulty: recipe.difficulty as Difficulty,
      isFavorite: Boolean(recipe.isFavorite),
      isFeatured: Boolean(recipe.isFeatured),
      categories: getRecipeCategories(recipe.id),
      ingredients: getIngredientsByRecipeId(recipe.id),
      steps: getStepsByRecipeId(recipe.id),
    }));
  } catch (error) {
    console.error("Error al buscar recetas:", error);
    return [];
  }
};

// Obtener recetas favoritas
export const getFavoriteRecipes = (): Recipe[] => {
  try {
    const recipes = db.getAllSync<any>(
      "SELECT * FROM recipes WHERE isFavorite = 1 ORDER BY title ASC"
    );

    return recipes.map((recipe) => ({
      ...recipe,
      difficulty: recipe.difficulty as Difficulty,
      isFavorite: true,
      isFeatured: Boolean(recipe.isFeatured),
      categories: getRecipeCategories(recipe.id),
      ingredients: getIngredientsByRecipeId(recipe.id),
      steps: getStepsByRecipeId(recipe.id),
    }));
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};

// Alternar favorito
export const toggleFavorite = (recipeId: number): boolean => {
  try {
    const recipe = db.getFirstSync<any>(
      "SELECT isFavorite FROM recipes WHERE id = ?",
      [recipeId]
    );

    if (!recipe) return false;

    const newFavoriteStatus = recipe.isFavorite === 1 ? 0 : 1;

    db.runSync("UPDATE recipes SET isFavorite = ? WHERE id = ?", [
      newFavoriteStatus,
      recipeId,
    ]);

    return newFavoriteStatus === 1;
  } catch (error) {
    console.error("Error al cambiar favorito:", error);
    return false;
  }
};

// Crear una nueva receta
export const createRecipe = (recipe: Omit<Recipe, "id">): number => {
  try {
    const result = db.runSync(
      `INSERT INTO recipes (title, description, prepTimeMinutes, servings, difficulty, imageUrl, isFavorite, isFeatured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.title,
        recipe.description,
        recipe.prepTimeMinutes,
        recipe.servings,
        recipe.difficulty,
        recipe.imageUrl || null,
        recipe.isFavorite ? 1 : 0,
        recipe.isFeatured ? 1 : 0,
      ]
    );

    const recipeId = result.lastInsertRowId;

    // Insertar ingredientes
    recipe.ingredients.forEach((ing) => {
      db.runSync(
        `INSERT INTO ingredients (recipeId, item, amount, notes) VALUES (?, ?, ?, ?)`,
        [recipeId, ing.item, ing.amount, ing.notes || null]
      );
    });

    // Insertar pasos y objetivos
    recipe.steps.forEach((step) => {
      const stepResult = db.runSync(
        `INSERT INTO steps (recipeId, stepNumber, title, description, timerSeconds)
         VALUES (?, ?, ?, ?, ?)`,
        [
          recipeId,
          step.stepNumber,
          step.title,
          step.description,
          step.timerSeconds || null,
        ]
      );

      const stepId = stepResult.lastInsertRowId;

      // Insertar objetivos del paso
      step.objectives.forEach((objective) => {
        db.runSync(`INSERT INTO objectives (stepId, task) VALUES (?, ?)`, [
          stepId,
          objective,
        ]);
      });
    });

    console.log(`Receta "${recipe.title}" creada con ID: ${recipeId}`);
    return recipeId;
  } catch (error) {
    console.error("Error al crear receta:", error);
    throw error;
  }
};

// Helper: Obtener ingredientes de una receta
const getIngredientsByRecipeId = (recipeId: number): Ingredient[] => {
  try {
    return db.getAllSync<Ingredient>(
      "SELECT * FROM ingredients WHERE recipeId = ?",
      [recipeId]
    );
  } catch (error) {
    console.error("Error al obtener ingredientes:", error);
    return [];
  }
};

// Helper: Obtener pasos de una receta
const getStepsByRecipeId = (recipeId: number): CookingStep[] => {
  try {
    const steps = db.getAllSync<any>(
      "SELECT * FROM steps WHERE recipeId = ? ORDER BY stepNumber ASC",
      [recipeId]
    );

    return steps.map((step) => ({
      ...step,
      objectives: getObjectivesByStepId(step.id),
    }));
  } catch (error) {
    console.error("Error al obtener pasos:", error);
    return [];
  }
};

// Helper: Obtener objetivos de un paso
const getObjectivesByStepId = (stepId: number): string[] => {
  try {
    const objectives = db.getAllSync<{ task: string }>(
      "SELECT task FROM objectives WHERE stepId = ?",
      [stepId]
    );
    return objectives.map((obj) => obj.task);
  } catch (error) {
    console.error("Error al obtener objetivos:", error);
    return [];
  }
};

// Limpiar toda la base de datos (útil para desarrollo)
export const clearDatabase = () => {
  try {
    db.execSync("DELETE FROM objectives");
    db.execSync("DELETE FROM steps");
    db.execSync("DELETE FROM ingredients");
    db.execSync("DELETE FROM recipe_categories");
    db.execSync("DELETE FROM recipes");
    console.log("Base de datos limpiada");
  } catch (error) {
    console.error("Error al limpiar base de datos:", error);
  }
};
