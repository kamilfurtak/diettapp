import { Injectable, signal, computed, WritableSignal, Signal, inject, effect } from '@angular/core';
import { Meal, MealCategory } from '../models/meal.model';
import { DietPlan } from '../models/diet-plan.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private firebaseService = inject(FirebaseService);

  private readonly CALORIE_GOAL = 2357;
  private readonly PROTEIN_GOAL = 95;
  private readonly FAT_GOAL = 72;
  private readonly CARBS_GOAL = 338;

  loading = signal<boolean>(true);
  meals: WritableSignal<Meal[]> = signal([]);
  activePlan = signal<DietPlan | null>(null);

  readonly isPlanActiveToday: Signal<boolean>;

  readonly totalCalories: Signal<number>;
  readonly totalProtein: Signal<number>;
  readonly totalCarbs: Signal<number>;
  readonly totalFat: Signal<number>;
  
  readonly calorieProgress: Signal<number>;
  readonly proteinProgress: Signal<number>;
  readonly carbsProgress: Signal<number>;
  readonly fatProgress: Signal<number>;

  readonly breakfastMeals: Signal<Meal[]>;
  readonly lunchMeals: Signal<Meal[]>;
  readonly dinnerMeals: Signal<Meal[]>;
  readonly snacksMeals: Signal<Meal[]>;

  readonly breakfastCalories: Signal<number>;
  readonly lunchCalories: Signal<number>;
  readonly dinnerCalories: Signal<number>;
  readonly snacksCalories: Signal<number>;

  constructor() {
    effect(() => {
        if (this.firebaseService.isReady()) {
            this.loadInitialData();
        }
    });

    this.isPlanActiveToday = computed(() => {
      const plan = this.activePlan();
      if (!plan) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      
      const startLocal = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
      const endLocal = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
      
      return today >= startLocal && today <= endLocal;
    });

    this.totalCalories = computed(() => {
        const mealsTotal = this.meals().reduce((sum, meal) => sum + meal.calories, 0);
        const planTotal = this.isPlanActiveToday() ? this.activePlan()!.calories : 0;
        return mealsTotal + planTotal;
    });
    this.totalProtein = computed(() => {
        const mealsTotal = this.meals().reduce((sum, meal) => sum + meal.protein, 0);
        const planTotal = this.isPlanActiveToday() ? this.activePlan()!.protein : 0;
        return mealsTotal + planTotal;
    });
    this.totalCarbs = computed(() => {
        const mealsTotal = this.meals().reduce((sum, meal) => sum + meal.carbs, 0);
        const planTotal = this.isPlanActiveToday() ? this.activePlan()!.carbs : 0;
        return mealsTotal + planTotal;
    });
    this.totalFat = computed(() => {
        const mealsTotal = this.meals().reduce((sum, meal) => sum + meal.fat, 0);
        const planTotal = this.isPlanActiveToday() ? this.activePlan()!.fat : 0;
        return mealsTotal + planTotal;
    });

    this.calorieProgress = computed(() => Math.min((this.totalCalories() / this.CALORIE_GOAL) * 100, 100));
    this.proteinProgress = computed(() => Math.min((this.totalProtein() / this.PROTEIN_GOAL) * 100, 100));
    this.carbsProgress = computed(() => Math.min((this.totalCarbs() / this.CARBS_GOAL) * 100, 100));
    this.fatProgress = computed(() => Math.min((this.totalFat() / this.FAT_GOAL) * 100, 100));

    this.breakfastMeals = computed(() => this.meals().filter(m => m.category === 'Breakfast'));
    this.lunchMeals = computed(() => this.meals().filter(m => m.category === 'Lunch'));
    this.dinnerMeals = computed(() => this.meals().filter(m => m.category === 'Dinner'));
    this.snacksMeals = computed(() => this.meals().filter(m => m.category === 'Snacks'));

    const sumCaloriesByCategory = (category: MealCategory) => computed(() => 
        this.meals()
            .filter(m => m.category === category)
            .reduce((sum, meal) => sum + meal.calories, 0)
    );

    this.breakfastCalories = sumCaloriesByCategory('Breakfast');
    this.lunchCalories = sumCaloriesByCategory('Lunch');
    this.dinnerCalories = sumCaloriesByCategory('Dinner');
    this.snacksCalories = sumCaloriesByCategory('Snacks');
  }

  private async loadInitialData() {
    const uid = this.firebaseService.user()?.uid;
    if (!uid) {
        this.loading.set(false);
        return;
    }
    
    try {
        const [meals, plan] = await Promise.all([
            this.firebaseService.getMealsForToday(uid),
            this.firebaseService.getDietPlan(uid)
        ]);

        this.meals.set(meals);
        this.activePlan.set(plan);
    } catch (error) {
        console.error("Error loading initial data:", error);
    } finally {
        this.loading.set(false);
    }
  }

  addMeals(newMeals: Meal[]) {
    this.meals.update((currentMeals) => [...currentMeals, ...newMeals]);
    const uid = this.firebaseService.user()?.uid;
    if (uid) {
        this.firebaseService.addMeals(uid, newMeals);
    }
  }

  setDietPlan(plan: DietPlan) {
    this.activePlan.set(plan);
    const uid = this.firebaseService.user()?.uid;
    if (uid) {
        this.firebaseService.setDietPlan(uid, plan);
    }
  }

  removeDietPlan() {
    this.activePlan.set(null);
    const uid = this.firebaseService.user()?.uid;
    if (uid) {
        this.firebaseService.removeDietPlan(uid);
    }
  }
}