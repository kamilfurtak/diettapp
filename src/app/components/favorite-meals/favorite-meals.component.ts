
import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { MealService } from '../../services/meal.service';
import { FavoriteMeal } from '../../models/favorite-meal.model';
import { Meal } from '../../models/meal.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite-meals',
  template: `
    <div class="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold text-white mb-4">Favorite Meals</h2>
      @for (meal of favoriteMeals(); track meal.id) {
        <div class="bg-gray-800 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p class="text-white font-semibold">{{ meal.name }}</p>
            <p class="text-xs text-gray-400">
              {{ meal.protein }}g P / {{ meal.carbs }}g C / {{ meal.fat }}g F
            </p>
          </div>
          <div class="flex items-center gap-4">
            <p class="text-white font-bold">{{ meal.calories }} kcal</p>
            <button (click)="addMealToLog(meal)" class="bg-lime-300 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class FavoriteMealsComponent implements OnInit {
  favoriteMeals = signal<FavoriteMeal[]>([]);

  private firebaseService = inject(FirebaseService);
  private mealService = inject(MealService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadFavoriteMeals();
  }

  async loadFavoriteMeals(): Promise<void> {
    const user = this.firebaseService.user();
    if (user) {
      const meals = await this.firebaseService.getFavoriteMeals(user.uid);
      this.favoriteMeals.set(meals);
    }
  }

  addMealToLog(meal: FavoriteMeal) {
    const mealToAdd: Meal = {
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      category: meal.category,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      date: new Date().toISOString(),
      portion: 1
    };
    this.mealService.addMeals([mealToAdd]);
    this.router.navigate(['/log']);
  }
}
