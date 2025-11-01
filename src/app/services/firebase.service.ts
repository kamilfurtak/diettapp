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

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;

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

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user.set(user);
        this.isReady.set(true);
      } else {
        signInAnonymously(this.auth).catch(error => {
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
    const dateStr = this.getTodaysDateString();
    const mealsColRef = collection(this.db, 'users', userId, 'meals', dateStr, 'entries');
    const q = query(mealsColRef);
    const querySnapshot = await getDocs(q);
    const meals: Meal[] = [];
    querySnapshot.forEach((doc) => {
      meals.push(doc.data() as Meal);
    });
    return meals;
  }

  async addMeals(userId: string, meals: Meal[]): Promise<void> {
    const dateStr = this.getTodaysDateString();
    const mealsColRef = collection(this.db, 'users', userId, 'meals', dateStr, 'entries');
    
    const promises = meals.map(meal => addDoc(mealsColRef, meal));
    await Promise.all(promises);
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
}
