import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./about/about.component').then((m) => m.AboutComponent),
      },
    ],
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PublicModule {}
