export enum Difficulty {
  EASY = "Fácil",
  MEDIUM = "Medio",
  HARD = "Difícil",
}

export interface Ingredient {
  id?: number;
  item: string;
  amount: string;
  notes?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface StepObjective {
  id: string;
  task: string;
  isCompleted: boolean;
}

export interface CookingStep {
  id?: number;
  stepNumber: number;
  title: string;
  description: string;
  timerSeconds?: number;
  objectives: string[];
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  prepTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: CookingStep[];
  imageUrl?: string;
  isFavorite: boolean;
  isFeatured: boolean;
  categories: Category[];
}

// Nutrition Types
export interface NutritionData {
  id?: number;
  ingredient_name: string;
  spanish_name?: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamin_a_dv: number;
  vitamin_c_dv: number;
  calcium_dv: number;
  iron_dv: number;
  category?: string;
}

export interface RecipeNutrition {
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamin_a_dv: number;
  vitamin_c_dv: number;
  calcium_dv: number;
  iron_dv: number;
  servings: number;
  missing_ingredients?: string[];
}

export interface UnitConversion {
  id?: number;
  unit_name: string;
  ingredient_category?: string;
  grams_per_unit: number;
}

export interface ParsedAmount {
  quantity: number;
  unit: string;
  grams: number | null;
}

// Navigation Types

export type RootTabParamList = {
  RecetasTab: undefined;
  CategoriasTab: undefined;
  GuardadoTab: undefined;
};

export type RecetasStackParamList = {
  RecetasHome: undefined;
  RecipeDetails: { recipeId: number };
  Cooking: { recipe: Recipe };
};

export type CategoriasStackParamList = {
  CategoriasHome: undefined;
  RecipeDetails: { recipeId: number };
  Cooking: { recipe: Recipe };
};

export type GuardadoStackParamList = {
  GuardadoHome: undefined;
  RecipeDetails: { recipeId: number };
  Cooking: { recipe: Recipe };
};

export type RootStackParamList = RecetasStackParamList;
