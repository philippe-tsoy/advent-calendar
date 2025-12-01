import { Component, signal, computed, ChangeDetectionStrategy, effect, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  private storageListener?: (event: StorageEvent) => void;
  private dataUpdateListener?: () => void;

  readonly calendarDays = signal<CalendarDayData[]>([]);
  readonly openedDays = signal<Set<number>>(new Set());
  readonly selectedDay = signal<CalendarDayData | null>(null);
  readonly popupVisible = signal(false);
  readonly popupOriginX = signal<string | null>(null);
  readonly popupOriginY = signal<string | null>(null);

  constructor(
    private readonly calendarDataService: CalendarDataService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.loadOpenedDays();
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
    this.storageListener = (event: StorageEvent) => {
      if (event.key === 'advent-calendar-custom-data') {
        this.refreshCalendarData();
        this.cdr.markForCheck();
      }
    };
    window.addEventListener('storage', this.storageListener);

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
    const first28 = this.shuffleDays(allDays.filter(d => d.day >= 1 && d.day <= 28));
    const last4 = allDays.filter(d => d.day >= 29 && d.day <= 32).sort((a, b) => a.day - b.day);

    const grid: CalendarDayData[] = [];
    let shuffledIdx = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        if (col < 7) {
          if (shuffledIdx < first28.length) {
            grid.push(first28[shuffledIdx++]);
          }
        } else {
          grid.push(last4[row]);
        }
      }
    }
    this.calendarDays.set(grid);
  }

  private shuffleDays(days: CalendarDayData[]): CalendarDayData[] {
    const SHUFFLE_KEY = 'advent-calendar-shuffle-order';
    const storedOrder = localStorage.getItem(SHUFFLE_KEY);
    let shuffleOrder: number[];

    if (storedOrder) {
      try {
        shuffleOrder = JSON.parse(storedOrder) as number[];
        if (shuffleOrder.length !== days.length) {
          shuffleOrder = this.generateShuffleOrder(days.length);
          localStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffleOrder));
        }
      } catch {
        shuffleOrder = this.generateShuffleOrder(days.length);
        localStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffleOrder));
      }
    } else {
      shuffleOrder = this.generateShuffleOrder(days.length);
      localStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffleOrder));
    }

    return shuffleOrder.map(index => days[index]);
  }

  private generateShuffleOrder(length: number): number[] {
    const seed = 12345;
    let rng = seed;

    const seededRandom = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    const indices = Array.from({ length }, (_, i) => i);

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
        const normalized = openedArray.map(v => (typeof v === 'number' ? v : Number(v))).filter(n => !Number.isNaN(n));
        this.openedDays.set(new Set(normalized));
      } catch {
        this.openedDays.set(new Set());
      }
    }
  }

  isUnlocked(day: number): boolean {
    const today = new Date();
    const currentYear = today.getFullYear();
    const calendarStartDate = new Date(currentYear, 11, 1);
    const dayDate = new Date(calendarStartDate);
    dayDate.setDate(calendarStartDate.getDate() + day - 1);
    if (dayDate.getMonth() !== 11) {
      dayDate.setFullYear(currentYear + 1);
    }
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
      const wasAlreadyOpened = this.openedDays().has(day);
      if (!wasAlreadyOpened) {
        const currentOpened = new Set(this.openedDays());
        currentOpened.add(day);
        this.openedDays.set(currentOpened);
      }
      this.selectedDay.set(dayData);
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
        setTimeout(() => this.popupVisible.set(true), 900);
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
    this.openedDays.set(new Set());
    localStorage.removeItem('advent-calendar-opened');
    this.popupVisible.set(false);
    this.selectedDay.set(null);
  }
}
