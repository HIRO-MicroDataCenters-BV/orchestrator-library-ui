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
} from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { provideHighcharts } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { getTranslocoConfig } from './transloco-config';
import { routes } from './app.routes';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([])),
    provideTransloco(getTranslocoConfig()),
    provideHighcharts({ instance: async () => Highcharts }),
  ],
};
