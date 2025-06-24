import { Component } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';

import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SafePipe],
  template: `<div class="container">
    <iframe
      [src]="url | safe : 'resourceUrl'"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>`,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  url = environment.dashboardUrl;
  constructor(apiService: ApiService) {
    console.log('DashboardComponent initialized', apiService.getAccessToken());
    this.url += '?token=' + apiService.getAccessToken();
  }
}
