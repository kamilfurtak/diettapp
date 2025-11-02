
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Meal, MealCategory } from './models/meal.model';
import { MealService } from './services/meal.service';
import { FavoriteProduct } from './models/favorite-product.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
  ],
})
export class App {
  mealService = inject(MealService);
  router = inject(Router);

  toggleFavorites() {
    this.router.navigate(['/favorites']);
  }
}
