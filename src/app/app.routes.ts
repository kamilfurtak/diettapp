import { Routes } from '@angular/router';
import { StreakComponent } from './streak/streak';
import { MealLogComponent } from './components/meal-log/meal-log.component';
import { AddMealComponent } from './components/add-meal/add-meal.component';
import { DietPlanComponent } from './components/diet-plan/diet-plan.component';

export const routes: Routes = [
    { path: 'streak', component: StreakComponent },
    { path: 'log', component: MealLogComponent },
    { path: 'add/:category', component: AddMealComponent },
    { path: 'plan', component: DietPlanComponent },
    { path: '', redirectTo: '/streak', pathMatch: 'full' },
];
