import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PrivateModule {}
