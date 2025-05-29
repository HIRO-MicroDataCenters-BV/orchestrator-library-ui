import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ProfileComponent } from './profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes), ProfileComponent],
})
export class ProfileModule {}
