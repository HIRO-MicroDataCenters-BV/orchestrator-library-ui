import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ErrorLayoutComponent } from './layouts/error-layout/error-layout.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Защищенные маршруты (требуют авторизации)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/emdc/clusters',
        pathMatch: 'full',
      },
      {
        path: 'emdc',
        children: [
          {
            path: 'clusters',
            loadComponent: () =>
              import('./pages/home/home.component').then(
                (m) => m.HomeComponent
              ),
            data: { title: 'Панель управления' },
          },
          {
            path: 'ui-kit',
            loadComponent: () =>
              import('./pages/ui-kit/ui-kit.component').then(
                (m) => m.UiKitComponent
              ),
            data: { title: 'UI Kit' },
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
        data: { title: 'Admin' },
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        data: { title: 'Вход' },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        data: { title: 'Регистрация' },
      },
    ],
  },
  {
    path: 'error',
    component: ErrorLayoutComponent,
    children: [
      {
        path: '404',
        loadComponent: () =>
          import('./pages/error/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          ),
        data: { title: 'Not Found' },
      },
      {
        path: '403',
        loadComponent: () =>
          import('./pages/error/forbidden/forbidden.component').then(
            (m) => m.ForbiddenComponent
          ),
        data: { title: 'Forbidden' },
      },
      {
        path: '500',
        loadComponent: () =>
          import('./pages/error/server-error/server-error.component').then(
            (m) => m.ServerErrorComponent
          ),
        data: { title: 'Internal Server Error' },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/error/404',
  },
];
