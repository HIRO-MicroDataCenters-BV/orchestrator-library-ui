import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../../pipes/safe.pipe';
import { AuthService } from '../../core/services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-grafana',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `<div class="container">
    <div
      class="iframe-wrapper"
      [class.loading]="isLoading"
      [class.error]="hasError"
    >
      <iframe
        [src]="grafanaUrl | safe : 'resourceUrl'"
        frameborder="0"
        allowfullscreen
        (load)="onIframeLoad()"
        (error)="onIframeError()"
        #grafanaFrame
      ></iframe>
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner">Loading Grafana...</div>
      </div>
      <div class="error-overlay" *ngIf="hasError">
        <div class="error-message">
          <h3>Unable to load Grafana</h3>
          <p>Please check your connection and try again.</p>
          <button (click)="retryLoad()" class="retry-button">Retry</button>
        </div>
      </div>
    </div>
  </div>`,
  styleUrls: ['./grafana.component.scss'],
})
export class GrafanaComponent implements OnInit {
  private readonly authService = inject(AuthService);

  grafanaUrl = '';
  isLoading = true;
  hasError = false;

  ngOnInit(): void {
    this.loadGrafana();
  }

  private loadGrafana(): void {
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

    // Add cache-busting parameter to force reload on retry
    const cacheBuster = new Date().getTime();
    const separator = this.grafanaUrl.includes('?') ? '&' : '?';
    this.grafanaUrl = `${this.grafanaUrl}${separator}_t=${cacheBuster}`;

    this.isLoading = true;
    this.hasError = false;
  }

  onIframeLoad(): void {
    this.isLoading = false;
    this.hasError = false;
    console.log('[GRAFANA IFRAME] Successfully loaded');
  }

  onIframeError(): void {
    this.isLoading = false;
    this.hasError = true;
    console.error('[GRAFANA IFRAME] Failed to load');
  }

  retryLoad(): void {
    console.log('[GRAFANA IFRAME] Retrying load...');
    this.loadGrafana();
  }
}
