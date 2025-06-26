import { Component } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';

import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-k8s',
  standalone: true,
  imports: [SafePipe],
  template: `<div class="container">
    <iframe
      [src]="url | safe : 'resourceUrl'"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>`,
  styleUrls: ['./k8s.component.scss'],
})
export class K8sComponent {
  url = environment.dashboardUrl;
  constructor(apiService: ApiService) {
    this.url += '?token=' + apiService.getAccessToken();
  }
}
