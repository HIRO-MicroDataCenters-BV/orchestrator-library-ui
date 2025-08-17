import { Component } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';

import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { K8sMockService } from '../../mock/k8s-mock.service';
import { K8S_CONSTANTS, STORAGE_KEYS } from '../../shared/constants';
import { setStorageItem, TokenStorage } from '../../shared/utils';

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
  useMockData = false;

  constructor(
    private apiService: ApiService,
    private k8sMockService: K8sMockService
  ) {
    // Get token from safe storage if available
    const tokenService = this.useMockData ? this.k8sMockService : this.apiService;

    if (this.useMockData) {
      this.k8sMockService.getK8sToken().subscribe((res) => {
        setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, (res as any).token);
        const token = TokenStorage.getAccessToken(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          this.url += '/?token=' + token;
        }
      });
    } else {
      this.apiService
        .getK8sToken({
          namespace: K8S_CONSTANTS.DEFAULT_VALUES.NAMESPACE,
          service_account_name: K8S_CONSTANTS.DEFAULT_VALUES.SERVICE_ACCOUNT_NAME,
        })
        .subscribe((res) => {
          setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, (res as any).token);
          const token = TokenStorage.getAccessToken(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            this.url += '/?token=' + token;
          }
        });
    }
  }
}
