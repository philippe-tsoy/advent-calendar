import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type WindowState = 'locked' | 'unlocked' | 'opened';

@Component({
  selector: 'app-window',
  imports: [CommonModule],
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowComponent {
    private readonly colors = ['white', 'green', 'red'] as const;
    private randomColor: (typeof this.colors)[number];

    constructor() {
      // pick a color once per component instance
      // assigned in constructor to avoid referencing `this` in field initializers
      let choice = this.colors[Math.floor(Math.random() * this.colors.length)];
      // if white is chosen, pick red or green instead (also random)
      if (choice === 'white') {
        choice = Math.random() < 0.5 ? 'red' : 'green';
      }
      this.randomColor = choice;
    }

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

  open = output<{ x: number; y: number }>();

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

  onClick(event: MouseEvent): void {
    if (this.state() !== 'locked') {
      this.open.emit({ x: event.clientX, y: event.clientY });
    }
  }
}

