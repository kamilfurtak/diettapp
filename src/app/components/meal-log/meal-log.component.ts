import { ChangeDetectionStrategy, Component, computed, signal, Signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealService } from '../../services/meal.service';
import { Meal, MealCategory } from '../../models/meal.model';
import { Router } from '@angular/router';

interface MealCategoryContainer {
  name: MealCategory;
  meals: Signal<Meal[]>;
  calories: Signal<number>;
}

@Component({
  selector: 'app-meal-log',
  templateUrl: './meal-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class MealLogComponent {
  public mealService = inject(MealService);
  private router = inject(Router);

  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  todayIndex = new Date().getDay();

  mealCategories: MealCategoryContainer[] = [
    { name: 'Breakfast', meals: this.mealService.breakfastMeals, calories: this.mealService.breakfastCalories },
    { name: 'Lunch', meals: this.mealService.lunchMeals, calories: this.mealService.lunchCalories },
    { name: 'Dinner', meals: this.mealService.dinnerMeals, calories: this.mealService.dinnerCalories },
    { name: 'Snacks', meals: this.mealService.snacksMeals, calories: this.mealService.snacksCalories },
  ];

  isFavorite = (meal: Meal) => computed(() => 
    this.mealService.favoriteMeals().some(fav => fav.name === meal.name)
  );

  addMeal(category: MealCategory) {
    this.router.navigate(['/add-meal'], { queryParams: { category } });
  }

  addMealToFavorites(meal: Meal) {
    this.mealService.addFavoriteMeal(meal);
  }

  removeMeal(mealId: string) {
    this.mealService.removeMeal(mealId);
  }
  
  editPlan() {
    this.router.navigate(['/set-plan']);
  }
}
