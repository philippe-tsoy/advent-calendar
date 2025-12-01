import { inject, Injectable, signal } from '@angular/core';
import { CALENDAR_DAYS, CalendarDay } from '../constants/calendar-data';

export interface CalendarDayData {
  day: number;
  display?: string;
  message: string;
  imagePath: string;
  imageData?: string; // base64 data for uploaded images
}

@Injectable({
  providedIn: 'root'
})
export class CalendarDataService {
  private readonly STORAGE_KEY = 'advent-calendar-custom-data';

  getDayData(day: number): CalendarDayData {
    // First check localStorage for custom data
    const customData = this.getCustomData();
    const customDay = customData.find(d => d.day === day);

    if (customDay) {
      return customDay;
    }

    // Fall back to constants
    const defaultDay = CALENDAR_DAYS.find(d => d.day === day);
    if (defaultDay) {
      return {
        day: defaultDay.day,
        display: defaultDay.display,
        message: defaultDay.message,
        imagePath: defaultDay.imagePath
      };
    }

    // Return empty data if not found
    return {
      day,
      message: `Day ${day}`,
      imagePath: ''
    };
  }

  getAllDays(): CalendarDayData[] {
    const customData = this.getCustomData();
    const result: CalendarDayData[] = [];

    for (let i = 1; i <= 32; i++) {
      const customDay = customData.find(d => d.day === i);
      if (customDay) {
        result.push(customDay);
      } else {
        const defaultDay = CALENDAR_DAYS.find(d => d.day === i);
        if (defaultDay) {
          result.push({
            day: defaultDay.day,
            display: defaultDay.display,
            message: defaultDay.message,
            imagePath: defaultDay.imagePath
          });
        } else {
          result.push({
            day: i,
            message: `Day ${i}`,
            imagePath: ''
          });
        }
      }
    }

    return result;
  }

  saveDayData(dayData: CalendarDayData): void {
    const customData = this.getCustomData();
    const index = customData.findIndex(d => d.day === dayData.day);

    if (index >= 0) {
      customData[index] = { ...dayData };
    } else {
      customData.push({ ...dayData });
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customData));
  }

  deleteDayData(day: number): void {
    const customData = this.getCustomData();
    const filtered = customData.filter(d => d.day !== day);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  private getCustomData(): CalendarDayData[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        // Normalize day to number in case older stored values used strings
        return parsed.map(d => ({
          ...d,
          day: typeof d.day === 'number' ? d.day : Number(d.day),
        })) as CalendarDayData[];
      } catch {
        return [];
      }
    }
    return [];
  }

  getImageUrl(dayData: CalendarDayData): string {
    // If imageData (base64) exists, use it
    if (dayData.imageData) {
      return dayData.imageData;
    }
    // Otherwise use the imagePath
    return dayData.imagePath;
  }
}

