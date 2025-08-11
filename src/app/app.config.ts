import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { getTranslocoConfig } from './transloco-config';
import { routes } from './app.routes';
import { authInterceptor } from './core/services/auth/auth.interceptor';
import { ApiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideTransloco(getTranslocoConfig()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
  ],
};
