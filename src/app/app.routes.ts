import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ErrorLayoutComponent } from './layouts/error-layout/error-layout.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Protected routes (require authentication)
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
              import('./pages/emdc/clusters/clusters.component').then(
                (m) => m.ClustersComponent
              ),
            data: { title: 'Clusters' },
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
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        data: { title: 'Login' },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        data: { title: 'Register' },
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
        data: { title: '404 - Not Found' },
      },
      {
        path: '500',
        loadComponent: () =>
          import('./pages/error/server-error/server-error.component').then(
            (m) => m.ServerErrorComponent
          ),
        data: { title: '500 - Server Error' },
      },
    ],
  },
  { path: '**', redirectTo: '/error/404' },
];
