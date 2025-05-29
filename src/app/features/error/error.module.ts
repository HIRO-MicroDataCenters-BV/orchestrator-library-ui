import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ErrorPageComponent } from './error-page/error-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error',
        component: ErrorPageComponent,
        data: { status: 500, message: 'Internal Server Error' },
      },
      {
        path: '404',
        component: ErrorPageComponent,
        data: { status: 404, message: 'Page Not Found' },
      },
      {
        path: '500',
        component: ErrorPageComponent,
        data: { status: 500, message: 'Internal Server Error' },
      },
    ],
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes), ErrorPageComponent],
})
export class ErrorModule {}
