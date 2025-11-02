import { MealCategory } from "./meal.model";

export interface FavoriteMeal {
    id: string;
    name: string;
    calories: number;
    category: MealCategory;
    protein: number;
    carbs: number;
    fat: number;
  }
  