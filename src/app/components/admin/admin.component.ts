import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CalendarDataService, CalendarDayData } from '../../services/calendar-data.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit {
  readonly selectedDay = signal<number>(1);
  readonly message = signal<string>('');
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string>('');
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  readonly days = Array.from({ length: 32 }, (_, i) => i + 1);

  constructor(private readonly calendarDataService: CalendarDataService) {}

  ngOnInit(): void {
    this.loadDayData(1);
  }

  onDayChange(day: number): void {
    this.selectedDay.set(day);
    this.loadDayData(day);
    this.clearMessages();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('Image size must be less than 5MB');
      return;
    }

    this.imageFile.set(file);
    this.errorMessage.set('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.imagePreview.set(result);
    };
    reader.readAsDataURL(file);
  }

  loadDayData(day: number): void {
    const dayData = this.calendarDataService.getDayData(day);
    this.message.set(dayData.message);

    const imageUrl = this.calendarDataService.getImageUrl(dayData);
    if (imageUrl && imageUrl.startsWith('data:')) {
      this.imagePreview.set(imageUrl);
    } else if (imageUrl) {
      this.imagePreview.set(imageUrl);
    } else {
      this.imagePreview.set('');
    }

    this.imageFile.set(null);
  }

  save(): void {
    const day = this.selectedDay();
    const msg = this.message().trim();

    if (!msg) {
      this.errorMessage.set('Please enter a message');
      return;
    }

    const dayData: CalendarDayData = {
      day,
      display: this.calendarDataService.getDayData(day).display,
      message: msg,
      imagePath: '',
      imageData: this.imagePreview() && this.imagePreview().startsWith('data:')
        ? this.imagePreview()
        : undefined
    };

    try {
      this.calendarDataService.saveDayData(dayData);
      this.successMessage.set(`Day ${day} saved successfully!`);
      this.errorMessage.set('');

      window.dispatchEvent(new Event('calendar-data-updated'));

      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error) {
      this.errorMessage.set('Failed to save. Please try again.');
    }
  }

  delete(): void {
    const day = this.selectedDay();

    if (confirm(`Are you sure you want to delete custom data for Day ${day}? This will restore the default.`)) {
      this.calendarDataService.deleteDayData(day);
      this.loadDayData(day);
      this.successMessage.set(`Day ${day} restored to default!`);
      this.errorMessage.set('');

      window.dispatchEvent(new Event('calendar-data-updated'));

      setTimeout(() => this.successMessage.set(''), 3000);
    }
  }

  clearImage(): void {
    this.imageFile.set(null);
    this.imagePreview.set('');
    this.loadDayData(this.selectedDay());
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
