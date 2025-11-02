import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StreakService {
  private readonly streak = signal<number>(0);
  private readonly longestStreak = signal<number>(0);
  private readonly lastMarkedDate = signal<Date | null>(null);

  constructor() {
    this.loadStreak();
  }

  private loadStreak() {
    const streak = localStorage.getItem('streak');
    const longestStreak = localStorage.getItem('longestStreak');
    const lastMarkedDate = localStorage.getItem('lastMarkedDate');

    if (streak) {
      this.streak.set(JSON.parse(streak));
    }

    if (longestStreak) {
      this.longestStreak.set(JSON.parse(longestStreak));
    }

    if (lastMarkedDate) {
      this.lastMarkedDate.set(new Date(JSON.parse(lastMarkedDate)));
    }
  }

  getStreak() {
    return this.streak();
  }

  getLongestStreak() {
    return this.longestStreak();
  }

  getLastMarkedDate() {
    return this.lastMarkedDate();
  }

  markDay() {
    const today = new Date();
    const lastMarked = this.lastMarkedDate();

    if (lastMarked) {
      const diff = today.getTime() - lastMarked.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      if (diffDays === 1) {
        this.streak.set(this.streak() + 1);
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

    localStorage.setItem('streak', JSON.stringify(this.streak()));
    localStorage.setItem('longestStreak', JSON.stringify(this.longestStreak()));
    localStorage.setItem('lastMarkedDate', JSON.stringify(this.lastMarkedDate()));
  }
}
