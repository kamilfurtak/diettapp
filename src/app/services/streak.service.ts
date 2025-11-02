import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private streak = signal(0);
  private longestStreak = signal(0);
  private lastMarkedDate = signal<Date | null>(null);
  private markedDates = signal<Date[]>([]);

  constructor() {
    this.loadStreak();
  }

  getStreak() {
    return this.streak.asReadonly();
  }

  getLongestStreak() {
    return this.longestStreak.asReadonly();
  }

  getLastMarkedDate() {
    return this.lastMarkedDate.asReadonly();
  }

  getMarkedDates() {
    return this.markedDates.asReadonly();
  }

  markDay() {
    const today = new Date();
    const lastDate = this.lastMarkedDate();

    if (lastDate) {
      const diff = today.getTime() - lastDate.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

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
    this.markedDates.update(dates => [...dates, today]);
    this.saveStreak();
  }

  private saveStreak() {
    localStorage.setItem('streak', this.streak().toString());
    localStorage.setItem('longestStreak', this.longestStreak().toString());
    localStorage.setItem('lastMarkedDate', this.lastMarkedDate()?.toISOString() || '');
    localStorage.setItem('markedDates', JSON.stringify(this.markedDates()));
  }

  private loadStreak() {
    const streak = localStorage.getItem('streak');
    const longestStreak = localStorage.getItem('longestStreak');
    const lastMarkedDate = localStorage.getItem('lastMarkedDate');
    const markedDates = localStorage.getItem('markedDates');

    if (streak) {
      this.streak.set(parseInt(streak, 10));
    }

    if (longestStreak) {
      this.longestStreak.set(parseInt(longestStreak, 10));
    }

    if (lastMarkedDate) {
      this.lastMarkedDate.set(new Date(lastMarkedDate));
    }

    if (markedDates) {
      this.markedDates.set(JSON.parse(markedDates).map((d: string) => new Date(d)));
    }
  }
}
