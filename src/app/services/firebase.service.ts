import { inject, Injectable, signal } from '@angular/core';
import { Auth, onAuthStateChanged, signInAnonymously, User } from '@angular/fire/auth';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc, addDoc
} from '@angular/fire/firestore';
import { DietPlan } from '../models/diet-plan.model';
import { FavoriteMeal } from '../models/favorite-meal.model';
import { FavoriteProduct } from '../models/favorite-product.model';
import { Meal } from '../models/meal.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth: Auth = inject(Auth);
  private db: Firestore = inject(Firestore);

  user = signal<User | null>(null);
  isReady = signal(false);

  constructor() {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.user.set(user);
        this.isReady.set(true);
      } else {
        signInAnonymously(this.auth!).catch((error: any) => {
          console.error('Anonymous sign-in failed', error);
          this.isReady.set(true); // Unblock app even if auth fails
        });
      }
    });
  }

  private getTodaysDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  syncMealsForToday(userId: string, onMealsUpdate: (meals: Meal[]) => void): () => void {
    const dateStr = this.getTodaysDateString();
    const mealsColRef = collection(this.db, 'users', userId, 'meals', dateStr, 'entries');
    const q = query(mealsColRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const meals: Meal[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Meal, 'id'>;
        meals.push({ id: doc.id, ...data });
      });
      onMealsUpdate(meals);
    });

    return unsubscribe;
  }

  async getMealsForToday(userId: string): Promise<Meal[]> {
    const dateStr = this.getTodaysDateString();
    const mealsColRef = collection(this.db, 'users', userId, 'meals', dateStr, 'entries');
    const q = query(mealsColRef);
    const querySnapshot = await getDocs(q);
    const meals: Meal[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Meal, 'id'>;
      meals.push({ id: doc.id, ...data });
    });
    return meals;
  }

  async addMeals(userId: string, meals: Meal[]): Promise<void> {
    const dateStr = this.getTodaysDateString();
    const mealsColRef = collection(this.db, 'users', userId, 'meals', dateStr, 'entries');

    const promises = meals.map(meal => addDoc(mealsColRef, meal));
    await Promise.all(promises);
  }

  async removeMeal(userId: string, mealId: string): Promise<void> {
    const dateStr = this.getTodaysDateString();
    const mealDocRef = doc(this.db, 'users', userId, 'meals', dateStr, 'entries', mealId);
    await deleteDoc(mealDocRef);
  }

  async getDietPlan(userId: string): Promise<DietPlan | null> {
    const planDocRef = doc(this.db, 'users', userId, 'plans', 'active');
    const docSnap = await getDoc(planDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as DietPlan;
    } else {
      return null;
    }
  }

  async setDietPlan(userId: string, plan: DietPlan): Promise<void> {
    const planDocRef = doc(this.db, 'users', userId, 'plans', 'active');
    await setDoc(planDocRef, plan);
  }

  async removeDietPlan(userId: string): Promise<void> {
    const planDocRef = doc(this.db, 'users', userId, 'plans', 'active');
    await deleteDoc(planDocRef);
  }

  async getFavoriteProducts(userId: string): Promise<FavoriteProduct[]> {
    const productsColRef = collection(this.db, 'users', userId, 'favoriteProducts');
    const q = query(productsColRef);
    const querySnapshot = await getDocs(q);
    const products: FavoriteProduct[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<FavoriteProduct, 'id'>;
      products.push({ id: doc.id, ...data });
    });
    return products;
  }

  async getFavoriteMeals(userId: string): Promise<FavoriteMeal[]> {
    const mealsColRef = collection(this.db, 'users', userId, 'favoriteMeals');
    const q = query(mealsColRef);
    const querySnapshot = await getDocs(q);
    const meals: FavoriteMeal[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<FavoriteMeal, 'id'>;
      meals.push({ id: doc.id, ...data });
    });
    return meals;
  }

  async addFavoriteProduct(userId: string, product: FavoriteProduct): Promise<FavoriteProduct> {
    const productsColRef = collection(this.db, 'users', userId, 'favoriteProducts');
    const { id, ...productData } = product;
    const docRef = await addDoc(productsColRef, productData);
    return { id: docRef.id, ...productData } as FavoriteProduct;
  }

  async addFavoriteMeal(userId: string, meal: Omit<FavoriteMeal, 'id'>): Promise<string> {
    const mealsColRef = collection(this.db, 'users', userId, 'favoriteMeals');
    const docRef = await addDoc(mealsColRef, meal);
    return docRef.id;
  }

  async deleteFavoriteProduct(userId: string, productId: string): Promise<void> {
    const productDocRef = doc(this.db, 'users', userId, 'favoriteProducts', productId);
    await deleteDoc(productDocRef);
  }

  async removeFavoriteMeal(userId: string, mealId: string): Promise<void> {
    const mealDocRef = doc(this.db, 'users', userId, 'favoriteMeals', mealId);
    await deleteDoc(mealDocRef);
  }
}
