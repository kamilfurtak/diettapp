
import { Component, ChangeDetectionStrategy, signal, ViewChild, ElementRef, OnDestroy, output, inject, effect, afterNextRender } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeminiService } from '../../services/gemini.service';
import { MealService } from '../../services/meal.service';
import { Meal, MealCategory } from '../../models/meal.model';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FavoriteProduct } from '../../models/favorite-product.model';

type Status = 'idle' | 'capturing' | 'captured' | 'analyzing' | 'results' | 'error' | 'adding' | 'picking';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule] 
})
export class AddMealComponent implements OnDestroy {
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private geminiService = inject(GeminiService);
  private mealService = inject(MealService);
  private fb = inject(FormBuilder);

  category = signal<MealCategory | null>(null);
  status = signal<Status>('idle');
  imageDataUrl = signal<string | null>(null);
  analysisResult = signal<Omit<Meal, 'category' | 'portion'>[]>([]);
  errorMessage = signal<string>('');
  mealForm: FormGroup;
  favoriteMeals = this.mealService.favoriteMeals;
  
  private stream: MediaStream | null = null;

  constructor() {
    this.mealForm = this.fb.group({
      name: ['', Validators.required],
      calories: ['', [Validators.required, Validators.min(0)]],
      protein: ['', [Validators.required, Validators.min(0)]],
      carbs: ['', [Validators.required, Validators.min(0)]],
      fat: ['', [Validators.required, Validators.min(0)]],
    });

    this.route.params.subscribe(params => {
      this.category.set(params['category'] as MealCategory);
    });

    effect(() => {
      if (this.status() === 'capturing') {
        afterNextRender(() => {
          this.initializeCameraStream();
        });
      }
    });
  }

  addMeal() {
    if (this.mealForm.valid) {
      const newMeal: Meal = {
        ...this.mealForm.value,
        category: this.category(),
        portion: 1,
      };
      this.mealService.addMeals([newMeal]);
      this.router.navigate(['/log']);
    }
  }
  
  addFavoriteMeal(meal: FavoriteProduct) {
    const newMeal: Meal = {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      category: this.category()!,
      portion: 1,
    };
    this.mealService.addMeals([newMeal]);
    this.router.navigate(['/log']);
  }

  private async initializeCameraStream() {
    if (!this.video?.nativeElement) {
      console.error('Video element not available.');
      this.errorMessage.set('Could not initialize camera view.');
      this.status.set('error');
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.video.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
      this.errorMessage.set('Could not access the camera. Please ensure permissions are granted.');
      this.status.set('error');
    }
  }

  startCamera() {
    this.status.set('capturing');
  }

  captureImage() {
    if (!this.stream || !this.video?.nativeElement) return;
    const videoEl = this.video.nativeElement;
    const canvasEl = this.canvas.nativeElement;
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const context = canvasEl.getContext('2d');
    context?.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    const dataUrl = canvasEl.toDataURL('image/jpeg');
    this.imageDataUrl.set(dataUrl);
    this.status.set('captured');
    this.stopCamera();
  }

  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imageDataUrl.set(e.target.result as string);
          this.status.set('captured');
        } else {
            this.errorMessage.set('Could not read the selected file. Please try another image.');
            this.status.set('error');
        }
      };
      reader.onerror = () => {
        this.errorMessage.set('An error occurred while reading the file.');
        this.status.set('error');
      };
      reader.readAsDataURL(file);
    }
  }

  retake() {
    this.imageDataUrl.set(null);
    this.analysisResult.set([]);
    this.status.set('idle');
  }

  async analyze() {
    const dataUrl = this.imageDataUrl();
    if (!dataUrl) return;

    this.status.set('analyzing');
    this.errorMessage.set('');

    try {
      // Remove 'data:image/jpeg;base64,' prefix
      const base64Image = dataUrl.split(',')[1];
      const result = await this.geminiService.analyzeMealPhoto(base64Image);
      
      if(result && result.length > 0) {
        this.analysisResult.set(result as any);
        this.status.set('results');
      } else {
        this.errorMessage.set('Could not identify any food in the image. Please try again with a clearer picture.');
        this.status.set('error');
      }
    } catch (error) {
      console.error(error);
      this.errorMessage.set((error as Error).message || 'An unknown error occurred.');
      this.status.set('error');
    }
  }
  
  addMealsToLog() {
    const result = this.analysisResult();
    const category = this.category();
    if (result.length > 0 && category) {
      const mealsWithCategory: Meal[] = result.map(meal => ({ ...meal, category, portion: 1 }));
      this.mealService.addMeals(mealsWithCategory);
      this.router.navigate(['/log']);
    }
  }

  close() {
    this.router.navigate(['/log']);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
