import { Component, input, output, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.visible]': 'visible()',
    '[class.hidden]': '!visible()'
  }
})
export class PopupComponent {
  visible = input.required<boolean>();
  message = input.required<string>();
  imagePath = input.required<string>();
  originX = input<string | null | undefined>();
  originY = input<string | null | undefined>();

  @ViewChild('popupContent', { static: false }) popupContent!: ElementRef<HTMLElement>;

  private readonly animationEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';

  constructor() {
    // watch visibility and trigger JS-driven animation when it becomes visible
    effect(() => {
      const v = this.visible && this.visible();
      if (v) {
        // small timeout to ensure element is in DOM
        setTimeout(() => this.animateFromOrigin(), 0);
      } else {
        // reset styles when hidden
        setTimeout(() => this.resetAnimationStyles(), 0);
      }
    });
  }

  close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private animateFromOrigin(): void {
    try {
      const el = this.popupContent?.nativeElement;
      if (!el) return;
      // We'll animate from the middle of the screen.
      // Compute a scale that makes the popup appear ~10px wide at start:
      const popupWidth = el.offsetWidth || el.getBoundingClientRect().width || 300;
      const startSizePx = 10;
      let startScale = startSizePx / popupWidth;
      if (startScale <= 0) startScale = 0.01;
      if (startScale > 1) startScale = 1;

      // ensure transform-origin is center so it grows from the middle
      el.style.transformOrigin = '50% 50%';

      // apply initial transform (no transition) — small and heavily rotated for a clear spin
      el.style.transition = 'none';
      el.style.transform = `scale(${startScale}) rotate(-720deg)`;
      el.style.opacity = '0';

      // force layout, then animate to final state with longer duration and dramatic easing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `transform 1.2s ${this.animationEasing}, opacity 0.6s ease`;
          el.style.transform = `scale(1) rotate(0deg)`;
          el.style.opacity = '1';
        });
      });
    } catch {
      // if anything fails, skip JS animation — CSS fallback remains
    }
  }

  private resetAnimationStyles(): void {
    try {
      const el = this.popupContent?.nativeElement;
      if (!el) return;
      el.style.transition = '';
      el.style.transform = '';
      el.style.opacity = '';
    } catch {
      // ignore
    }
  }
}

