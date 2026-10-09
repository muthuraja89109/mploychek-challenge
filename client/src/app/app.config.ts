import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { activityInterceptor } from './core/activity.interceptor';
import { AuthService } from './core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // Interceptors run in this order on every request
    provideHttpClient(withInterceptors([authInterceptor, activityInterceptor])),
    // App load: restore the session BEFORE the first page renders,
    // so guards already know whether you are signed in after a refresh.
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession())),
  ],
};
