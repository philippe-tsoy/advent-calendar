import { Component, signal, computed, ChangeDetectionStrategy, effect, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from '../window/window.component';
import { PopupComponent } from '../popup/popup.component';
import { CalendarDataService, CalendarDayData } from '../../services/calendar-data.service';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, WindowComponent, PopupComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit, OnDestroy {
  private readonly calendarDataService = inject(CalendarDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private storageListener?: (event: StorageEvent) => void;
  private dataUpdateListener?: () => void;

  readonly calendarDays = signal<CalendarDayData[]>([]);
  readonly openedDays = signal<Set<number>>(new Set());
  readonly selectedDay = signal<CalendarDayData | null>(null);
  readonly popupVisible = signal(false);
  readonly popupOriginX = signal<string | null>(null);
  readonly popupOriginY = signal<string | null>(null);

  constructor() {
    // Load opened days from localStorage on init
    this.loadOpenedDays();

    // Load calendar days
    this.refreshCalendarData();

    // Save opened days to localStorage whenever it changes
    effect(() => {
      const opened = this.openedDays();
      if (opened.size > 0) {
        localStorage.setItem('advent-calendar-opened', JSON.stringify(Array.from(opened)));
      } else {
        localStorage.removeItem('advent-calendar-opened');
      }
    });
  }

  ngOnInit(): void {
    // Listen for storage changes to refresh calendar when admin updates data
    this.storageListener = (event: StorageEvent) => {
      if (event.key === 'advent-calendar-custom-data') {
        // Refresh calendar data when custom data changes
        this.refreshCalendarData();
        this.cdr.markForCheck();
      }
    };
    window.addEventListener('storage', this.storageListener);

    // Also listen for custom events (for same-tab updates)
    // The admin component can trigger this when saving
    this.dataUpdateListener = () => {
      this.refreshCalendarData();
      this.cdr.markForCheck();
    };
    window.addEventListener('calendar-data-updated', this.dataUpdateListener);
  }

  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
    if (this.dataUpdateListener) {
      window.removeEventListener('calendar-data-updated', this.dataUpdateListener);
    }
  }

  private refreshCalendarData(): void {
    const allDays = this.calendarDataService.getAllDays();
    // Separate days 1-28 and 29-32
    const first28 = this.shuffleDays(allDays.filter(d => d.day >= 1 && d.day <= 28));
    const last4 = allDays.filter(d => d.day >= 29 && d.day <= 32).sort((a, b) => a.day - b.day);

    // Build grid row-wise: 4 rows x 8 columns
    const grid: CalendarDayData[] = [];
    let shuffledIdx = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        if (col < 7) {
          // Fill columns 0-6 with shuffled days
          if (shuffledIdx < first28.length) {
            grid.push(first28[shuffledIdx++]);
          }
        } else {
          // Last column: days 29-32
          grid.push(last4[row]);
        }
      }
    }
    this.calendarDays.set(grid);
  }

  private shuffleDays(days: CalendarDayData[]): CalendarDayData[] {
    const SHUFFLE_KEY = 'advent-calendar-shuffle-order';

    // Check if we already have a stored shuffle order
    const storedOrder = localStorage.getItem(SHUFFLE_KEY);
    let shuffleOrder: number[];

    if (storedOrder) {
      try {
        shuffleOrder = JSON.parse(storedOrder) as number[];
        // Verify the order is still valid (same number of days)
        if (shuffleOrder.length !== days.length) {
          shuffleOrder = this.generateShuffleOrder(days.length);
          localStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffleOrder));
        }
      } catch {
        shuffleOrder = this.generateShuffleOrder(days.length);
        localStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffleOrder));
      }
    } else {
      // Generate new shuffle order using seeded random
      shuffleOrder = this.generateShuffleOrder(days.length);
      localStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffleOrder));
    }

    // Apply the shuffle order
    return shuffleOrder.map(index => days[index]);
  }

  private generateShuffleOrder(length: number): number[] {
    // Use a seeded random number generator for consistent results
    const seed = 12345; // Fixed seed for consistent shuffling
    let rng = seed;

    const seededRandom = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    // Create array of indices
    const indices = Array.from({ length }, (_, i) => i);

    // Fisher-Yates shuffle with seeded random
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
  }

  private loadOpenedDays(): void {
    const stored = localStorage.getItem('advent-calendar-opened');
    if (stored) {
      try {
        const openedArray = JSON.parse(stored) as Array<number | string>;
        // Normalize to numbers
        const normalized = openedArray.map(v => (typeof v === 'number' ? v : Number(v))).filter(n => !Number.isNaN(n));
        this.openedDays.set(new Set(normalized));
      } catch {
        // Invalid data, start fresh
        this.openedDays.set(new Set());
      }
    }
  }

  isUnlocked(day: number): boolean {
    // TEMPORARY: Date restriction commented out for testing
    // return true;

    const today = new Date();
    const currentYear = today.getFullYear();

    // Calculate the date for this day (Dec 1 + day - 1)
    const calendarStartDate = new Date(currentYear, 11, 1); // Month 11 = December
    const dayDate = new Date(calendarStartDate);
    dayDate.setDate(calendarStartDate.getDate() + day - 1);

    // If we're past December, it's next year
    if (dayDate.getMonth() !== 11) {
      dayDate.setFullYear(currentYear + 1);
    }

    // Compare dates (ignore time)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayDateOnly = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

    return dayDateOnly <= todayDateOnly;
  }

  isOpened(day: number): boolean {
    return this.openedDays().has(day);
  }

  onWindowOpen(day: number, origin?: { x: number; y: number }): void {
    const dayData = this.calendarDataService.getDayData(day);
    if (dayData) {
      // Determine if this day was already opened
      const wasAlreadyOpened = this.openedDays().has(day);

      // Mark as opened if not already
      if (!wasAlreadyOpened) {
        const currentOpened = new Set(this.openedDays());
        currentOpened.add(day);
        this.openedDays.set(currentOpened);
      }

      // Show popup immediately if already opened, otherwise after delay
      this.selectedDay.set(dayData);
      // set origin coordinates for animation (px values)
      if (origin) {
        this.popupOriginX.set(`${origin.x}px`);
        this.popupOriginY.set(`${origin.y}px`);
      } else {
        this.popupOriginX.set(null);
        this.popupOriginY.set(null);
      }

      if (wasAlreadyOpened) {
        this.popupVisible.set(true);
      } else {
        setTimeout(() => {
          this.popupVisible.set(true);
        }, 900);
      }
    }
  }

  onPopupClose(): void {
    this.popupVisible.set(false);
    this.selectedDay.set(null);
  }

  getImageUrl(dayData: CalendarDayData): string {
    return this.calendarDataService.getImageUrl(dayData);
  }

  resetOpenedDays(): void {
    // Clear the opened days
    this.openedDays.set(new Set());

    // Remove from localStorage
    localStorage.removeItem('advent-calendar-opened');

    // Close any open popup
    this.popupVisible.set(false);
    this.selectedDay.set(null);
  }
}

