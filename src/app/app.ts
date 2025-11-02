
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Meal, MealCategory } from './models/meal.model';
import { MealService } from './services/meal.service';
import { FavoriteProductsComponent } from './components/favorite-products/favorite-products.component';
import { FavoriteProduct } from './models/favorite-product.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FavoriteProductsComponent, 
    RouterModule
  ],
})
export class App {
  mealService = inject(MealService);
  router = inject(Router);
  showFavorites = signal(false);
  selectedCategory = signal<MealCategory | null>(null);


  toggleFavorites() {
    this.showFavorites.update(value => !value);
  }

  addFavoriteProductToMeal(product: FavoriteProduct) {
    const category = this.selectedCategory();
    if (category) {
      const meal: Meal = {
        name: product.name,
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        category: category,
        portion: 1
      };
      this.mealService.addMeals([meal]);
      this.toggleFavorites();
      this.router.navigate(['/log']);
    }
  }
}
