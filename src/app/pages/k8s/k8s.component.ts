import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface K8sTokenResponse {
  success: boolean;
  token: string;
  cached?: boolean;
}

@Component({
  selector: 'app-k8s',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './k8s.component.html',
  styleUrl: './k8s.component.scss',
})
export class K8sComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  dashboardUrl: SafeResourceUrl | null = null;

  private get proxyUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.getToken().subscribe({
      next: (response: K8sTokenResponse) => {
        if (response.success && response.token) {
          const dashboardUrlWithToken = `${
            this.proxyUrl
          }/?token=${encodeURIComponent(response.token)}`;
          this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            dashboardUrlWithToken
          );
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load K8s dashboard:', error);
      },
    });
  }

  private getToken(): Observable<K8sTokenResponse> {
    return this.http
      .get<K8sTokenResponse>(`${this.proxyUrl}/get-token`)
      .pipe(catchError(() => of({ success: false, token: '' })));
  }
}
