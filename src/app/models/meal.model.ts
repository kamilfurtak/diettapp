export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface Meal {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: MealCategory;
  portion: number;
}