
import { Component, ChangeDetectionStrategy, inject, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealService } from '../../services/meal.service';
import { DietPlan } from '../../models/diet-plan.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diet-plan',
  templateUrl: './diet-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule]
})
export class DietPlanComponent implements OnInit {
   mealService = inject(MealService);
  // FIX: Explicitly typing `fb` with FormBuilder resolves the type inference issue
  // where the compiler was unable to determine the type from `inject(FormBuilder)`.
  private fb: FormBuilder = inject(FormBuilder);

  // FIX: Use output() function instead of @Output decorator
  close = output<void>();

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
    this.close.emit();
  }

  removePlan() {
    this.mealService.removeDietPlan();
    this.close.emit();
  }
}
