import { Component, input, output, ChangeDetectionStrategy, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDataService, CalendarDayData } from '../../services/calendar-data.service';

@Component({
  selector: 'app-day32-animation',
  imports: [CommonModule],
  templateUrl: './day32-animation.component.html',
  styleUrl: './day32-animation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Day32AnimationComponent implements OnInit, OnDestroy {
  visible = input.required<boolean>();
  close = output<void>();

  private animationTimer?: number;
  private currentIndex = 0; // Track current index for slideshow
  private animationStartTime?: number; // Track when animation started
  readonly currentDayIndex = signal<number>(0);
  readonly isShowingDay32 = signal<boolean>(false);
  readonly isTitleTransitioning = signal<boolean>(false);
  readonly isFadingToBlack = signal<boolean>(false);
  readonly showNewYearMessage = signal<boolean>(false);
  private allDays: CalendarDayData[] = [];
  private transitionTimings: number[] = [];

  readonly currentDay = computed(() => {
    const index = this.currentDayIndex();
    if (index < this.allDays.length) {
      return this.allDays[index];
    }
    return null;
  });

  readonly currentDate = computed(() => {
    if (this.isShowingDay32()) {
      return this.formatDate(new Date(2026, 0, 1)); // January 1st 2026
    }
    const day = this.currentDay();
    if (day) {
      return this.formatDateForDay(day.day);
    }
    return '';
  });

  readonly leftImagePath = computed(() => {
    const day = this.currentDay();
    if (this.isShowingDay32()) {
      return 'assets/images/day-32.jpg';
    }
    if (day) {
      return this.calendarDataService.getImageUrl(day);
    }
    return '';
  });

  readonly rightImagePath = computed(() => {
    if (this.isShowingDay32()) {
      return ''; // No right image for day 32
    }
    const day = this.currentDay();
    if (day) {
      // Replace .jpg with -sc.jpg in the image path
      const basePath = day.imagePath.replace(/\.jpg$/, '-sc.png');
      return basePath;
    }
    return '';
  });

  readonly currentMessage = computed(() => {
    if (this.isShowingDay32()) {
      return ''; // No message for day 32
    }
    const day = this.currentDay();
    return day?.message || '';
  });

  readonly showSplitScreen = computed(() => !this.isShowingDay32());

  constructor(private readonly calendarDataService: CalendarDataService) {
    // Load all days 1-31
    this.allDays = Array.from({ length: 31 }, (_, i) =>
      this.calendarDataService.getDayData(i + 1)
    );

    this.transitionTimings = [
      3.50,
      3.05,
      2.65,
      2.30,
      2.00,
      1.70,
      1.45,
      1.23,
      1.05,
      0.88,
      0.75,
      0.70,
      0.66,
      0.66,
      0.62,
      0.62,
      0.62,
      0.62,
      0.62,
      0.66,
      0.66,
      0.70,
      0.72,
      0.74,
      0.76,
      0.88,
      1.10,
      1.40,
      1.75,
      2.20
    ];

    // Watch visibility and start animation when visible
    effect(() => {
      if (this.visible()) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    });
  }

  ngOnInit(): void {
    // Preload images
    this.preloadImages();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  private preloadImages(): void {
    // Preload all day images and screenshot images
    for (let i = 1; i <= 32; i++) {
      const dayData = this.calendarDataService.getDayData(i);
      const imageUrl = this.calendarDataService.getImageUrl(dayData);
      if (imageUrl && !imageUrl.startsWith('data:')) {
        const img = new Image();
        img.src = imageUrl;
      }

      // Preload screenshot images for days 1-31
      if (i <= 31) {
        const scPath = imageUrl.replace(/\.jpg$/, '-sc.jpg');
        if (scPath && !scPath.startsWith('data:')) {
          const scImg = new Image();
          scImg.src = scPath;
        }
      }
    }
  }

  private startAnimation(): void {
    this.stopAnimation(); // Clear any existing timers
    this.animationStartTime = Date.now(); // Record when animation starts
    this.currentIndex = 0;
    this.currentDayIndex.set(0);
    this.isShowingDay32.set(false);
    this.isTitleTransitioning.set(false);
    this.isFadingToBlack.set(false);
    this.showNewYearMessage.set(false);
    // Wait for background fade to complete (3s) before starting slideshow
    this.animationTimer = window.setTimeout(() => {
      this.playSlideshow();
    }, 3000);
  }

  private stopAnimation(): void {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = undefined;
    }
  }

  private playSlideshow(): void {
    if (this.currentIndex >= this.transitionTimings.length) {
      // After showing all 31 days, hold day 31 for 1.5 seconds
      this.animationTimer = window.setTimeout(() => {
        // Then fade to black
        this.isFadingToBlack.set(true);
        // After fade to black completes (1s), wait 1 second, then check if 10 seconds have passed
        this.animationTimer = window.setTimeout(() => {
          // Ensure at least 10 seconds have passed since animation started
          const elapsed = this.animationStartTime ? Date.now() - this.animationStartTime : 0;
          const remainingDelay = Math.max(0, 10000 - elapsed);

          this.animationTimer = window.setTimeout(() => {
            // Show New Year message first, prepare day 32 but keep it hidden
            // Set day 32 state first to keep overlay black, then set message
            this.isShowingDay32.set(true); // Prepare day 32 content (keeps overlay black)
            this.isFadingToBlack.set(false);
            // Set message first to ensure title is hidden before day 32 content appears
            this.showNewYearMessage.set(true);
            // After 5s (1s fade in + 3s visible + 1s fade out), hide message and show day 32
            this.animationTimer = window.setTimeout(() => {
              this.showNewYearMessage.set(false);
              // Day 32 is already set to show, it will fade in via CSS
              // Day 32 stays visible until user closes manually
            }, 5000); // 1s fade in + 3s visible + 1s fade out = 5s total
          }, remainingDelay);
        }, 2000); // 1s fade + 1s wait = 2s total
      }, 1500); // Hold day 31 for 1.5 seconds
      return;
    }

    // Wait for transition time, then increment index and hold for 80ms
    this.animationTimer = window.setTimeout(() => {
      this.currentIndex++;
      this.currentDayIndex.set(this.currentIndex);
      this.animationTimer = window.setTimeout(() => {
        this.playSlideshow();
      }, 80);
    }, this.transitionTimings[this.currentIndex] * 1000);
  }

  private generateTransitionTimings(
    imageCount: number = 31,
    totalDurationSeconds: number = 15,
    minTransitionSeconds: number = 0.18,
    maxTransitionSeconds: number = 0.75,
    imageHoldMs: number = 80
  ): number[] {
    const transitions = imageCount - 1;
    const raw: number[] = [];

    for (let i = 0; i < transitions; i++) {
      const t = i / (transitions - 1); // 0 → 1
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * t); // ease-in-out sine
      raw.push(
        maxTransitionSeconds -
        ease * (maxTransitionSeconds - minTransitionSeconds)
      );
    }

    const rawSum = raw.reduce((a, b) => a + b, 0);
    const holdTotal = (imageCount - 1) * imageHoldMs / 1000;
    const scale = (totalDurationSeconds - holdTotal) / rawSum;

    return raw.map(v => v * scale);
  }

  private formatDateForDay(day: number): string {
    const year = 2025;
    const month = 11; // December (0-indexed)
    const date = new Date(year, month, day);
    return this.formatDate(date);
  }

  private formatDate(date: Date): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    const ordinal = this.getOrdinalSuffix(day);

    return `${monthName} ${day}${ordinal} ${year}`;
  }

  private getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}

