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

// Navigation Types
export type RootStackParamList = {
  Search: undefined;
  RecipeDetails: { recipeId: number };
  Cooking: { recipe: Recipe };
};
