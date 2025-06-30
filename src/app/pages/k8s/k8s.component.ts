import { Component } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';

import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { STORAGE_KEYS } from '../../shared/constants';
import { TokenStorage } from '../../shared/utils';

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
  constructor(private apiService: ApiService) {
    // Get token from safe storage if available
    const token = TokenStorage.getAccessToken(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      this.url += '?token=' + token;
    }
  }
}
