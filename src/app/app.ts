import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { MealLogComponent } from './components/meal-log/meal-log.component';
import { AddMealComponent } from './components/add-meal/add-meal.component';
import { MealCategory } from './models/meal.model';
import { DietPlanComponent } from './components/diet-plan/diet-plan.component';
import { MealService } from './services/meal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MealLogComponent, AddMealComponent, DietPlanComponent],
})
export class App {
  mealService = inject(MealService);
  view = signal<'log' | 'add' | 'plan'>('log');
  selectedCategory = signal<MealCategory | null>(null);

  showAddMealView(category: MealCategory) {
    this.selectedCategory.set(category);
    this.view.set('add');
  }

  showLogView() {
    this.selectedCategory.set(null);
    this.view.set('log');
  }

  showPlanView() {
    this.view.set('plan');
  }
}
