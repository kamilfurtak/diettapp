import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { StreakService } from '../services/streak.service';

@Component({
  selector: 'app-streak',
  templateUrl: './streak.html',
  styleUrls: ['./streak.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe]
})
export class StreakComponent {
  private streakService = inject(StreakService);

  streak = this.streakService.getStreak();
  longestStreak = this.streakService.getLongestStreak();
  lastMarkedDate = this.streakService.getLastMarkedDate();

  isDayMarked = computed(() => {
    const lastDate = this.lastMarkedDate();
    if (!lastDate) {
      return false;
    }
    const today = new Date();
    return lastDate.getDate() === today.getDate() &&
           lastDate.getMonth() === today.getMonth() &&
           lastDate.getFullYear() === today.getFullYear();
  });

  markDay() {
    this.streakService.markDay();
  }
}
