
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealService } from '../../services/meal.service';
import { DietPlan } from '../../models/diet-plan.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diet-plan',
  templateUrl: './diet-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule]
})
export class DietPlanComponent implements OnInit {
   mealService = inject(MealService);
   router = inject(Router);
  private fb: FormBuilder = inject(FormBuilder);

  planForm!: FormGroup;

  ngOnInit() {
    const activePlan = this.mealService.activePlan();
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    this.planForm = this.fb.group({
      name: [activePlan?.name || 'My Boxed Diet', Validators.required],
      calories: [activePlan?.calories || 1400, [Validators.required, Validators.min(1)]],
      protein: [activePlan?.protein || 80, [Validators.required, Validators.min(0)]],
      carbs: [activePlan?.carbs || 160, [Validators.required, Validators.min(0)]],
      fat: [activePlan?.fat || 50, [Validators.required, Validators.min(0)]],
      startDate: [activePlan?.startDate || today, Validators.required],
      endDate: [activePlan?.endDate || nextMonthStr, Validators.required],
    });
  }

  savePlan() {
    if (this.planForm.invalid) {
      return;
    }
    const plan: DietPlan = this.planForm.value;
    this.mealService.setDietPlan(plan);
    this.router.navigate(['/log']);
  }

  removePlan() {
    this.mealService.removeDietPlan();
    this.router.navigate(['/log']);
  }

  close() {
    this.router.navigate(['/log']);
  }
}
