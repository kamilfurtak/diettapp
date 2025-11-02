import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private streak = signal(0);
  private longestStreak = signal(0);
  private lastMarkedDate = signal<Date | null>(null);

  getStreak() {
    return this.streak.asReadonly();
  }

  getLongestStreak() {
    return this.longestStreak.asReadonly();
  }

  getLastMarkedDate() {
    return this.lastMarkedDate.asReadonly();
  }

  markDay() {
    const today = new Date();
    const lastDate = this.lastMarkedDate();

    if (lastDate) {
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        this.streak.update(s => s + 1);
      } else if (diffDays > 1) {
        this.streak.set(1);
      }
    } else {
      this.streak.set(1);
    }

    if (this.streak() > this.longestStreak()) {
      this.longestStreak.set(this.streak());
    }

    this.lastMarkedDate.set(today);
  }
}
