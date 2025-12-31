import { Component, input, output, computed, ChangeDetectionStrategy, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type WindowState = 'locked' | 'unlocked' | 'opened';

@Component({
  selector: 'app-window',
  imports: [CommonModule],
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowComponent implements OnDestroy {
    private readonly colors = ['white', 'green', 'red'] as const;
    readonly randomColor: (typeof this.colors)[number];
    private imageDelayTimer?: number;
    readonly showImage = signal<boolean>(false);


    classString = computed(() => {
      const classes: string[] = [];
      classes.push('window');
      classes.push(`window--${this.randomColor}`);
      const st = this.state();
      classes.push(st);
      if (st !== 'locked') classes.push('clickable');
      if (st === 'opened') classes.push('opened');
      return classes.join(' ');
    });
  day = input.required<number>();
  display = input<string | undefined>('');
  isUnlocked = input.required<boolean>();
  isOpened = input.required<boolean>();
  imageUrl = input<string>('');

  open = output<{ x: number; y: number; color: 'red' | 'green' }>();

  state = computed<WindowState>(() => {
    if (this.isOpened()) {
      return 'opened';
    }
    if (this.isUnlocked()) {
      return 'unlocked';
    }
    return 'locked';
  });

  hasValidImage = computed(() => {
    const url = this.imageUrl();
    return url && url.trim() !== '';
  });

  shouldShowImage = computed(() => {
    if (!this.hasValidImage() || this.state() !== 'opened') {
      return false;
    }
    // For day 32, use the showImage signal to control visibility
    if (this.day() === 32) {
      return this.showImage();
    }
    // For other days, show immediately when opened
    return true;
  });

  constructor() {
    // pick a color once per component instance
    // assigned in constructor to avoid referencing `this` in field initializers
    let choice = this.colors[Math.floor(Math.random() * this.colors.length)];
    // if white is chosen, pick red or green instead (also random)
    if (choice === 'white') {
      choice = Math.random() < 0.5 ? 'red' : 'green';
    }
    this.randomColor = choice;

    // Watch for when day 32 is opened and delay showing the image
    effect(() => {
      const isOpened = this.isOpened();
      const day = this.day();
      
      if (day === 32 && isOpened) {
        // Clear any existing timer
        if (this.imageDelayTimer) {
          clearTimeout(this.imageDelayTimer);
        }
        // Hide image initially
        this.showImage.set(false);
        // Show image after 10 seconds
        this.imageDelayTimer = window.setTimeout(() => {
          this.showImage.set(true);
        }, 10000);
      } else if (day !== 32) {
        // For non-32 days, show image immediately when opened
        this.showImage.set(true);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.imageDelayTimer) {
      clearTimeout(this.imageDelayTimer);
    }
  }

  onClick(event: MouseEvent): void {
    if (this.state() !== 'locked') {
      // randomColor is always 'red' or 'green' due to constructor logic
      const color: 'red' | 'green' = this.randomColor === 'white' ? 'red' : this.randomColor;
      this.open.emit({ x: event.clientX, y: event.clientY, color });
    }
  }
}

