
import { ChangeDetectionStrategy, Component, OnInit, signal, output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { FavoriteProduct } from '../../models/favorite-product.model';

@Component({
  selector: 'app-favorite-products',
  templateUrl: './favorite-products.component.html',
  styleUrls: ['./favorite-products.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule]
})
export class FavoriteProductsComponent implements OnInit {
  productSelected = output<FavoriteProduct>();
  close = output<void>();

  favoriteProducts = signal<FavoriteProduct[]>([]);
  productForm: FormGroup;

  private firebaseService = inject(FirebaseService);
  private fb = inject(FormBuilder);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fat: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadFavoriteProducts();
  }

  async loadFavoriteProducts(): Promise<void> {
    const user = this.firebaseService.user();
    if (user) {
      const products = await this.firebaseService.getFavoriteProducts(user.uid);
      this.favoriteProducts.set(products);
    }
  }

  async addProduct(): Promise<void> {
    if (this.productForm.invalid) {
      return;
    }

    const user = this.firebaseService.user();
    if (user) {
      const newProduct: FavoriteProduct = this.productForm.value;
      const addedProduct = await this.firebaseService.addFavoriteProduct(user.uid, newProduct);
      this.favoriteProducts.update(products => [...products, addedProduct]);
      this.productForm.reset({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const user = this.firebaseService.user();
    if (user) {
      await this.firebaseService.deleteFavoriteProduct(user.uid, productId);
      this.favoriteProducts.update(products => products.filter(p => p.id !== productId));
    }
  }

  selectProduct(product: FavoriteProduct): void {
    this.productSelected.emit(product);
  }
}
