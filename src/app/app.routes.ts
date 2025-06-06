import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DefaultLayoutComponent } from './layouts/default-layout/default-layout.component';
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
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'ui-kit',
        loadComponent: () => import('./pages/ui-kit/ui-kit.component').then(m => m.UiKitComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        // В реальном приложении здесь будет компонент админ-панели
      }
    ]
  },
  
  // Маршруты авторизации (публичные)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  
  // Маршруты ошибок
  {
    path: 'error',
    component: ErrorLayoutComponent,
    children: [
      {
        path: '404',
        loadComponent: () => import('./pages/error/not-found/not-found.component').then(m => m.NotFoundComponent)
      },
      {
        path: '403',
        loadComponent: () => import('./pages/error/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
      },
      {
        path: '500',
        loadComponent: () => import('./pages/error/server-error/server-error.component').then(m => m.ServerErrorComponent)
      }
    ]
  },
  
  // Перенаправление на страницу 404 для несуществующих маршрутов
  {
    path: '**',
    redirectTo: '/error/404'
  }
];
