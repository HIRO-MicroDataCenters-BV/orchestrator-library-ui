import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DexAuthService, DexAuthState, DexApiRequest } from '../../core/services';

@Component({
  selector: 'app-dex-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">DEX Authentication Test</h1>

      <!-- Authentication Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Authentication</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Login</label>
            <input
              type="email"
              [(ngModel)]="credentials.login"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@kubeflow.org"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              [(ngModel)]="credentials.password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>
        </div>

        <button
          (click)="authenticate()"
          [disabled]="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Authenticating...' : 'Authenticate' }}
        </button>

        <button
          (click)="clearSession()"
          class="ml-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Session
        </button>
      </div>

      <!-- Status Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Status</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl mb-2">
              {{ isAuthenticated ? '✅' : '❌' }}
            </div>
            <div class="text-sm font-medium">Authentication</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-2">
              {{ authState.state ? '✅' : '❌' }}
            </div>
            <div class="text-sm font-medium">State</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-2">
              {{ authState.sessionCookie ? '✅' : '❌' }}
            </div>
            <div class="text-sm font-medium">Session</div>
          </div>
        </div>

        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
      </div>

      <!-- API Testing Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">API Testing</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Endpoint</label>
            <input
              type="text"
              [(ngModel)]="apiRequest.endpoint"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/pipeline/apis/v1beta1/pipelines"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Method</label>
            <select
              [(ngModel)]="apiRequest.method"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        <button
          (click)="makeApiRequest()"
          [disabled]="!isAuthenticated || loading"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Make Request
        </button>
      </div>

      <!-- Response Section -->
      <div *ngIf="apiResponse" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">API Response</h2>
        <pre class="bg-gray-100 p-4 rounded-md overflow-auto text-sm">{{ apiResponseText }}</pre>
      </div>

      <!-- Log Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">
          Log
          <button
            (click)="clearLog()"
            class="ml-2 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </h2>
        <div class="bg-black text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          <div *ngFor="let entry of logEntries" [class]="getLogClass(entry.level)">
            <span class="text-gray-500">{{ entry.timestamp }}</span>
            <span class="ml-2">[{{ entry.level.toUpperCase() }}]</span>
            <span class="ml-2">{{ entry.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DexTestComponent implements OnInit {
  private readonly dexAuthService = inject(DexAuthService);

  // Authentication state
  authState: DexAuthState = {};
  isAuthenticated = false;
  loading = false;
  error: string | null = null;

  // Form data
  credentials = {
    login: 'admin@kubeflow.org',
    password: '12341234'
  };

  apiRequest: DexApiRequest = {
    endpoint: '/pipeline/apis/v1beta1/pipelines',
    method: 'GET'
  };

  // Response data
  apiResponse: any = null;
  apiResponseText = '';

  // Log entries
  logEntries: Array<{ timestamp: string; level: string; message: string }> = [];

  ngOnInit(): void {
    this.updateAuthState();
    this.log('info', 'DEX Test Component initialized');
  }

  authenticate(): void {
    this.loading = true;
    this.error = null;
    this.clearLog();

    this.log('info', `Starting authentication for user: ${this.credentials.login}`);

    this.dexAuthService
      .authorizeWithDex(this.credentials.login, this.credentials.password)
      .subscribe({
        next: (result) => {
          this.loading = false;
          this.updateAuthState();
          this.log('success', 'Authentication successful');
          this.log('info', `Session cookie obtained: ${result.authserviceSession.substring(0, 20)}...`);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Authentication failed';
          this.log('error', `Authentication failed: ${this.error}`);
        }
      });
  }

  clearSession(): void {
    this.dexAuthService.clearSession();
    this.updateAuthState();
    this.apiResponse = null;
    this.error = null;
    this.log('info', 'Session cleared');
  }

  makeApiRequest(): void {
    if (!this.isAuthenticated) {
      this.error = 'Please authenticate first';
      return;
    }

    this.loading = true;
    this.error = null;

    this.log('info', `Making ${this.apiRequest.method} request to ${this.apiRequest.endpoint}`);

    this.dexAuthService
      .makeAuthenticatedRequest({
        ...this.apiRequest,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.apiResponse = response;
          this.apiResponseText = JSON.stringify(response, null, 2);
          this.log('success', 'API request successful');
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'API request failed';
          this.log('error', `API request failed: ${this.error}`);
        }
      });
  }

  private updateAuthState(): void {
    const session = this.dexAuthService.getSession();
    this.isAuthenticated = !!session;

    if (session) {
      this.authState = {
        sessionCookie: session,
        // Note: state and code are not exposed by the service after auth
      };
    } else {
      this.authState = {};
    }
  }

  private log(level: 'info' | 'success' | 'error', message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.push({ timestamp, level, message });

    // Keep only last 50 entries
    if (this.logEntries.length > 50) {
      this.logEntries = this.logEntries.slice(-50);
    }
  }

  clearLog(): void {
    this.logEntries = [];
  }

  getLogClass(level: string): string {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
      default:
        return 'text-blue-400';
    }
  }
}
