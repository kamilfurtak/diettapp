
import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { MealService } from '../../services/meal.service';
import { Meal, MealCategory } from '../../models/meal.model';
import { CommonModule } from '@angular/common';

interface MealCategoryInfo {
  name: MealCategory;
  meals: () => Meal[];
  calories: () => number;
}

@Component({
  selector: 'app-meal-log',
  templateUrl: './meal-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MealLogComponent {
  mealService = inject(MealService);

  // FIX: Use output() function instead of @Output decorator
  addMealRequest = output<MealCategory>();
  editPlanRequest = output<void>();

  mealCategories: MealCategoryInfo[];
  daysOfWeek = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'];
  todayIndex = new Date().getDay(); // Sunday is 0, so we adjust

  constructor() {
    this.mealCategories = [
      { name: 'Breakfast', meals: this.mealService.breakfastMeals, calories: this.mealService.breakfastCalories },
      { name: 'Lunch', meals: this.mealService.lunchMeals, calories: this.mealService.lunchCalories },
      { name: 'Dinner', meals: this.mealService.dinnerMeals, calories: this.mealService.dinnerCalories },
      { name: 'Snacks', meals: this.mealService.snacksMeals, calories: this.mealService.snacksCalories },
    ];
  }

  addMeal(category: MealCategory) {
    this.addMealRequest.emit(category);
  }

  editPlan() {
    this.editPlanRequest.emit();
  }
}
