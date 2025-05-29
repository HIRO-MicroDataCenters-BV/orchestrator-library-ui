import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'public/home',
    pathMatch: 'full',
  },
  {
    path: 'public',
    loadChildren: () =>
      import('./features/public/public.module').then((m) => m.PublicModule),
  },
  {
    path: 'private',
    loadChildren: () =>
      import('./features/private/private.module').then((m) => m.PrivateModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./features/error/error.module').then((m) => m.ErrorModule),
  },
];
