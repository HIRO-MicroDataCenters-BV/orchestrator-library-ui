import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';

// Spartan UI imports
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmAlertImports } from '@spartan-ng/ui-alert-helm';

interface ProxyTestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

@Component({
  selector: 'app-proxy-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...HlmCardImports,
    HlmButtonDirective,
    HlmBadgeDirective,
    ...HlmAlertImports,
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">Proxy Configuration Test</h1>
        <p class="text-muted-foreground">Test proxy endpoints and authentication flow</p>
      </div>

      <!-- Test Controls -->
      <div hlmCard class="mx-auto max-w-md">
        <div hlmCardHeader class="text-center">
          <h2 hlmCardTitle>Test Runner</h2>
          <p hlmCardDescription>Execute proxy endpoint tests</p>
        </div>
        <div hlmCardContent class="space-y-4">
          <button
            hlmBtn
            class="w-full"
            (click)="runAllTests()"
            [disabled]="isRunning"
          >
            {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
          </button>
          <button
            hlmBtn
            variant="outline"
            class="w-full"
            (click)="clearResults()"
            [disabled]="isRunning"
          >
            Clear Results
          </button>
        </div>
      </div>

      <!-- Progress Overview -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle class="flex items-center gap-2">
            Test Progress
            <span hlmBadge variant="outline" class="text-xs">
              {{ completedTests }}/{{ totalTests }}
            </span>
          </h3>
        </div>
        <div hlmCardContent>
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-500"
              [style.width.%]="progressPercentage"
            ></div>
          </div>

          <!-- Quick Status -->
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="space-y-1">
              <div class="text-2xl font-bold text-green-600">{{ successCount }}</div>
              <div class="text-sm text-muted-foreground">Passed</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold text-red-600">{{ errorCount }}</div>
              <div class="text-sm text-muted-foreground">Failed</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold text-blue-600">{{ pendingCount }}</div>
              <div class="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Proxy Endpoints -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Proxy Endpoints</h3>
          <p hlmCardDescription>Current proxy configuration and test results</p>
        </div>
        <div hlmCardContent>
          <div class="grid gap-3">
            <div
              *ngFor="let test of testResults; trackBy: trackByEndpoint"
              class="flex items-center gap-3 p-3 rounded-lg border transition-all"
              [ngClass]="{
                'bg-green-50 border-green-200': test.status === 'success',
                'bg-blue-50 border-blue-200': test.status === 'pending',
                'bg-red-50 border-red-200': test.status === 'error'
              }"
            >
              <!-- Status Icon -->
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                [ngClass]="{
                  'bg-green-500 text-white': test.status === 'success',
                  'bg-blue-500 text-white': test.status === 'pending',
                  'bg-red-500 text-white': test.status === 'error'
                }"
              >
                <span *ngIf="test.status === 'success'">✓</span>
                <span *ngIf="test.status === 'error'">✕</span>
                <span *ngIf="test.status === 'pending'">⟳</span>
              </div>

              <!-- Endpoint Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium truncate">{{ test.endpoint }}</h4>
                  <div class="flex items-center gap-2">
                    <span
                      *ngIf="test.duration"
                      hlmBadge
                      variant="outline"
                      class="text-xs"
                    >
                      {{ test.duration }}ms
                    </span>
                    <span
                      hlmBadge
                      [variant]="
                        test.status === 'success' ? 'default' :
                        test.status === 'pending' ? 'secondary' : 'destructive'
                      "
                      class="text-xs"
                    >
                      {{ test.status | titlecase }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground mt-1">{{ getEndpointDescription(test.endpoint) }}</p>
                <div *ngIf="test.error" class="text-sm text-red-600 mt-1 font-medium">
                  {{ test.error }}
                </div>
                <div *ngIf="test.status === 'success' && test.response" class="mt-2">
                  <details class="text-xs">
                    <summary class="cursor-pointer font-medium text-green-600">View Response</summary>
                    <div class="mt-1 bg-green-100 p-2 rounded max-h-20 overflow-auto">
                      <pre>{{ formatResponse(test.response) }}</pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div *ngIf="testResults.length > 0" hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Test Summary</h3>
        </div>
        <div hlmCardContent>
          <div *ngIf="allTestsPassed" hlmAlert>
            <p hlmAlertDescription>✅ All proxy endpoints are working correctly!</p>
          </div>

          <div *ngIf="hasErrors" hlmAlert variant="destructive">
            <p hlmAlertDescription>❌ {{ errorCount }} endpoint(s) failed. Check configuration.</p>
          </div>

          <div *ngIf="isRunning" hlmAlert>
            <p hlmAlertDescription>⏳ Tests in progress... {{ completedTests }}/{{ totalTests }} completed</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProxyTestComponent implements OnInit {
  protected readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // State
  testResults: ProxyTestResult[] = [];
  isRunning = false;
  completedTests = 0;
  totalTests = 6;
  progressPercentage = 0;

  // Test endpoints
  private testEndpoints = [
    { path: '/api/health', description: 'API Backend Health Check' },
    { path: '/iframe-dashboard/api/v1/namespace', description: 'Kubernetes Dashboard' },
    { path: '/iframe-grafana/api/health', description: 'Grafana Monitoring' },
    { path: '/iframe-cog/health', description: 'COG Service' },
    { path: '/dex/.well-known/openid_configuration', description: 'DEX Authentication' },
    { path: '/authservice/oidc/callback', description: 'AuthService Callback' },
  ];

  // Computed properties
  get successCount(): number {
    return this.testResults.filter(t => t.status === 'success').length;
  }

  get errorCount(): number {
    return this.testResults.filter(t => t.status === 'error').length;
  }

  get pendingCount(): number {
    return this.testResults.filter(t => t.status === 'pending').length;
  }

  get allTestsPassed(): boolean {
    return this.testResults.length > 0 && this.errorCount === 0 && this.pendingCount === 0;
  }

  get hasErrors(): boolean {
    return this.errorCount > 0;
  }

  ngOnInit(): void {
    this.initializeTestResults();
  }

  private initializeTestResults(): void {
    this.testResults = this.testEndpoints.map(endpoint => ({
      endpoint: endpoint.path,
      status: 'pending' as const,
    }));
    this.totalTests = this.testResults.length;
  }

  async runAllTests(): Promise<void> {
    if (!this.isBrowser) return;

    this.isRunning = true;
    this.completedTests = 0;
    this.initializeTestResults();

    for (const result of this.testResults) {
      await this.testEndpoint(result);
      this.completedTests++;
      this.progressPercentage = (this.completedTests / this.totalTests) * 100;
    }

    this.isRunning = false;
  }

  private async testEndpoint(result: ProxyTestResult): Promise<void> {
    const startTime = Date.now();

    try {
      const response = await this.http.get(result.endpoint, {
        observe: 'response',
        responseType: 'text'
      }).toPromise();

      const duration = Date.now() - startTime;

      if (response && response.status >= 200 && response.status < 400) {
        result.status = 'success';
        result.response = response.body;
        result.duration = duration;
      } else {
        result.status = 'error';
        result.error = `HTTP ${response?.status}: ${response?.statusText}`;
        result.duration = duration;
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      result.status = 'error';
      result.error = this.formatError(error);
      result.duration = duration;
    }
  }

  private formatError(error: any): string {
    if (error.status === 0) {
      return 'Connection failed - endpoint unreachable';
    } else if (error.status === 404) {
      return 'Endpoint not found (404)';
    } else if (error.status === 403) {
      return 'Access forbidden (403)';
    } else if (error.status === 500) {
      return 'Internal server error (500)';
    } else if (error.status) {
      return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    } else {
      return error.message || 'Unknown error occurred';
    }
  }

  formatResponse(response: any): string {
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        return JSON.stringify(parsed, null, 2).substring(0, 200) + '...';
      } catch {
        return response.substring(0, 200) + '...';
      }
    }
    return JSON.stringify(response, null, 2).substring(0, 200) + '...';
  }

  getEndpointDescription(endpoint: string): string {
    const found = this.testEndpoints.find(e => e.path === endpoint);
    return found?.description || 'Proxy endpoint test';
  }

  clearResults(): void {
    this.initializeTestResults();
    this.completedTests = 0;
    this.progressPercentage = 0;
  }

  trackByEndpoint(index: number, item: ProxyTestResult): string {
    return item.endpoint;
  }
}
