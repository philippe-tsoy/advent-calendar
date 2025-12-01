import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: 'ZONE_CHANGE_DETECTION',
      useFactory: () => provideZoneChangeDetection({ eventCoalescing: true })
    },
    provideRouter(routes)
  ]
};
