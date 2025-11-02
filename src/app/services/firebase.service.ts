import { Injectable, signal } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.config';
import { DietPlan } from '../models/diet-plan.model';
import { Meal } from '../models/meal.model';
import { FavoriteProduct } from '../models/favorite-product.model';
import { FavoriteMeal } from '../models/favorite-meal.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;

  user = signal<User | null>(null);
  isReady = signal(false);

  constructor() {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        console.warn("Firebase configuration is not set. Persistence will not work. Please update src/config/firebase.config.ts");
        this.isReady.set(true); // Set to ready to unblock app, but persistence will fail.
        return;
    }

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

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

  async getMealsForToday(userId: string): Promise<Meal[]> {
    if (!this.db) return [];
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
    if (!this.db) return;
    const dateStr = this.getTodaysDateString();
    const mealsColRef = collection(this.db, 'users', userId, 'meals', dateStr, 'entries');

    const promises = meals.map(meal => addDoc(mealsColRef, meal));
    await Promise.all(promises);
  }

  async getDietPlan(userId: string): Promise<DietPlan | null> {
    if (!this.db) return null;
    const planDocRef = doc(this.db, 'users', userId, 'plans', 'active');
    const docSnap = await getDoc(planDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as DietPlan;
    } else {
      return null;
    }
  }

  async setDietPlan(userId: string, plan: DietPlan): Promise<void> {
    if (!this.db) return;
    const planDocRef = doc(this.db, 'users', userId, 'plans', 'active');
    await setDoc(planDocRef, plan);
  }

  async removeDietPlan(userId: string): Promise<void> {
    if (!this.db) return;
    const planDocRef = doc(this.db, 'users', userId, 'plans', 'active');
    await deleteDoc(planDocRef);
  }

  async getFavoriteProducts(userId: string): Promise<FavoriteProduct[]> {
    if (!this.db) return [];
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
    if (!this.db) return [];
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
    if (!this.db) {
      throw new Error('Firestore not available');
    }
    const productsColRef = collection(this.db, 'users', userId, 'favoriteProducts');
    const { id, ...productData } = product;
    const docRef = await addDoc(productsColRef, productData);
    return { id: docRef.id, ...productData } as FavoriteProduct;
  }

  async addFavoriteMeal(userId: string, meal: Omit<FavoriteMeal, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Firestore not available');
    }
    const mealsColRef = collection(this.db, 'users', userId, 'favoriteMeals');
    const docRef = await addDoc(mealsColRef, meal);
    return docRef.id;
  }

  async deleteFavoriteProduct(userId: string, productId: string): Promise<void> {
    if (!this.db) return;
    const productDocRef = doc(this.db, 'users', userId, 'favoriteProducts', productId);
    await deleteDoc(productDocRef);
  }

  async removeFavoriteMeal(userId: string, mealId: string): Promise<void> {
    if (!this.db) return;
    const mealDocRef = doc(this.db, 'users', userId, 'favoriteMeals', mealId);
    await deleteDoc(mealDocRef);
  }
}
