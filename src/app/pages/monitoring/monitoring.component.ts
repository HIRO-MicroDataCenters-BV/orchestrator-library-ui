import { Component, OnInit, inject } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';
import { AuthService } from '../../core/services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [SafePipe],
  template: `<div class="container">
    <iframe
      [src]="grafanaUrl | safe : 'resourceUrl'"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>`,
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent implements OnInit {
  private readonly authService = inject(AuthService);

  grafanaUrl = '';

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    const baseUrl = environment.grafanaUrl;

    if (token) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      this.grafanaUrl = `${baseUrl}${separator}access_token=${encodeURIComponent(
        token
      )}`;
    } else {
      this.grafanaUrl = baseUrl;
    }
  }
}
