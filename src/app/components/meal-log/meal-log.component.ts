
import { Component, ChangeDetectionStrategy, inject, output, computed } from '@angular/core';
import { MealService } from '../../services/meal.service';
import { Meal, MealCategory } from '../../models/meal.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  router = inject(Router);

  editPlanRequest = output<void>();

  mealCategories: MealCategoryInfo[];
  daysOfWeek = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'];
  todayIndex = new Date().getDay(); // Sunday is 0, so we adjust

  isFavorite = (meal: Meal) => computed(() => this.mealService.favoriteMeals().some(fav => fav.name === meal.name));

  constructor() {
    this.mealCategories = [
      { name: 'Breakfast', meals: this.mealService.breakfastMeals, calories: this.mealService.breakfastCalories },
      { name: 'Lunch', meals: this.mealService.lunchMeals, calories: this.mealService.lunchCalories },
      { name: 'Dinner', meals: this.mealService.dinnerMeals, calories: this.mealService.dinnerCalories },
      { name: 'Snacks', meals: this.mealService.snacksMeals, calories: this.mealService.snacksCalories },
    ];
  }

  addMeal(category: MealCategory) {
    this.router.navigate(['/add', category]);
  }

  editPlan() {
    this.editPlanRequest.emit();
  }

  addMealToFavorites(meal: Meal) {
    this.mealService.addFavoriteMeal(meal);
  }
}
