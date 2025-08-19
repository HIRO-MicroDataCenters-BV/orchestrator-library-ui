import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DexAuthService,
  DexAuthState,
  DexApiRequest,
} from '../../core/services';

// Spartan UI imports
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmAlertImports } from '@spartan-ng/ui-alert-helm';

@Component({
  selector: 'app-dex-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...HlmCardImports,
    HlmButtonDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmBadgeDirective,
    ...HlmAlertImports,
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">DEX Authentication Test</h1>
        <p class="text-muted-foreground">
          Test OAuth2 flow with DEX identity provider
        </p>
      </div>

      <!-- Authentication Form -->
      <div hlmCard class="mx-auto max-w-md">
        <div hlmCardHeader class="text-center">
          <h2 hlmCardTitle>Login Credentials</h2>
          <p hlmCardDescription>Enter your DEX authentication details</p>
        </div>
        <div hlmCardContent class="space-y-4">
          <div class="space-y-2">
            <label hlmLabel for="email">Email</label>
            <input
              hlmInput
              id="email"
              type="email"
              [(ngModel)]="credentials.login"
              placeholder="admin@hiro.com"
              [disabled]="loading"
            />
          </div>
          <div class="space-y-2">
            <label hlmLabel for="password">Password</label>
            <input
              hlmInput
              id="password"
              type="password"
              [(ngModel)]="credentials.password"
              placeholder="Enter password"
              [disabled]="loading"
            />
          </div>
          <button
            hlmBtn
            class="w-full"
            (click)="authenticate()"
            [disabled]="loading"
          >
            {{ loading ? 'Authenticating...' : 'Test Authentication' }}
          </button>
        </div>
      </div>

      <!-- Progress Steps -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle class="flex items-center gap-2">
            Authentication Flow
            <span hlmBadge variant="outline" class="text-xs">
              {{ currentStep }}/{{ totalSteps }}
            </span>
          </h3>
        </div>
        <div hlmCardContent>
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-500"
              [style.width.%]="progressPercentage"
            ></div>
          </div>

          <!-- Steps Grid -->
          <div class="grid gap-3">
            <div
              *ngFor="let step of authSteps; trackBy: trackByStepId"
              class="flex items-center gap-3 p-3 rounded-lg border transition-all"
              [ngClass]="{
                'bg-green-50 border-green-200': step.status === 'completed',
                'bg-blue-50 border-blue-200': step.status === 'active',
                'bg-red-50 border-red-200': step.status === 'error',
                'bg-gray-50 border-gray-200': step.status === 'pending'
              }"
            >
              <!-- Step Icon -->
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                [ngClass]="{
                  'bg-green-500 text-white': step.status === 'completed',
                  'bg-blue-500 text-white': step.status === 'active',
                  'bg-red-500 text-white': step.status === 'error',
                  'bg-gray-300 text-gray-600': step.status === 'pending'
                }"
              >
                <span *ngIf="step.status === 'completed'">✓</span>
                <span *ngIf="step.status === 'error'">✕</span>
                <span *ngIf="step.status === 'active'">{{ step.order }}</span>
                <span *ngIf="step.status === 'pending'">{{ step.order }}</span>
              </div>

              <!-- Step Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium truncate">{{ step.title }}</h4>
                  <span
                    hlmBadge
                    [variant]="
                      step.status === 'completed'
                        ? 'default'
                        : step.status === 'active'
                        ? 'secondary'
                        : step.status === 'error'
                        ? 'destructive'
                        : 'outline'
                    "
                    class="text-xs"
                  >
                    {{ step.status | titlecase }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ step.description }}
                </p>
                <div
                  *ngIf="step.error"
                  class="text-sm text-red-600 mt-1 font-medium"
                >
                  {{ step.error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div *ngIf="apiResponse || error" hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Test Results</h3>
        </div>
        <div hlmCardContent>
          <div *ngIf="error" hlmAlert variant="destructive" class="mb-4">
            <p hlmAlertDescription>{{ error }}</p>
          </div>

          <div *ngIf="isAuthenticated && !error" hlmAlert class="mb-4">
            <p hlmAlertDescription>
              ✅ Authentication successful! Session established.
            </p>
          </div>

          <div *ngIf="apiResponse" class="space-y-2">
            <h4 class="font-medium">API Response Sample:</h4>
            <div
              class="bg-gray-100 p-3 rounded text-sm font-mono max-h-40 overflow-auto"
            >
              {{ apiResponseText }}
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="testApiRequest()"
              [disabled]="!isAuthenticated || loading"
            >
              Test API Call
            </button>
            <button hlmBtn variant="ghost" size="sm" (click)="clearSession()">
              Clear Session
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DexTestComponent implements OnInit {
  private readonly dexAuthService = inject(DexAuthService);

  // State
  authState: DexAuthState = {};
  isAuthenticated = false;
  loading = false;
  error: string | null = null;

  // Progress
  currentStep = 0;
  totalSteps = 5;
  progressPercentage = 0;

  // Form
  credentials = {
    login: 'admin@hiro.com',
    password: 'adminpass',
  };

  // API Testing
  apiResponse: any = null;
  apiResponseText = '';

  // Steps
  authSteps = [
    {
      id: 'init',
      order: 1,
      title: 'Initialize Connection',
      description: 'Connecting to DEX server',
      status: 'pending' as 'pending' | 'active' | 'completed' | 'error',
      error: null as string | null,
    },
    {
      id: 'state',
      order: 2,
      title: 'Get State Token',
      description: 'Obtaining OAuth state parameter',
      status: 'pending' as 'pending' | 'active' | 'completed' | 'error',
      error: null as string | null,
    },
    {
      id: 'credentials',
      order: 3,
      title: 'Submit Credentials',
      description: 'Sending login information',
      status: 'pending' as 'pending' | 'active' | 'completed' | 'error',
      error: null as string | null,
    },
    {
      id: 'authorization',
      order: 4,
      title: 'Get Authorization',
      description: 'Receiving authorization code',
      status: 'pending' as 'pending' | 'active' | 'completed' | 'error',
      error: null as string | null,
    },
    {
      id: 'session',
      order: 5,
      title: 'Create Session',
      description: 'Establishing authenticated session',
      status: 'pending' as 'pending' | 'active' | 'completed' | 'error',
      error: null as string | null,
    },
  ];

  ngOnInit(): void {
    this.updateAuthState();
    this.updateProgressDisplay();
  }

  authenticate(): void {
    this.loading = true;
    this.error = null;
    this.resetSteps();

    // Step 1: Initialize
    this.setStepStatus('init', 'active');
    this.updateProgressDisplay();

    setTimeout(() => {
      this.setStepStatus('init', 'completed');
      this.setStepStatus('state', 'active');
      this.updateProgressDisplay();

      setTimeout(() => {
        this.setStepStatus('state', 'completed');
        this.setStepStatus('credentials', 'active');
        this.updateProgressDisplay();

        // Real authentication
        this.dexAuthService
          .authorizeWithDex(this.credentials.login, this.credentials.password)
          .subscribe({
            next: (result) => {
              this.loading = false;
              this.setStepStatus('credentials', 'completed');
              this.setStepStatus('authorization', 'completed');
              this.setStepStatus('session', 'completed');
              this.updateAuthState();
              this.updateProgressDisplay();
            },
            error: (err) => {
              this.loading = false;
              this.error = err.message || 'Authentication failed';
              this.handleAuthError(err);
            },
          });
      }, 800);
    }, 500);
  }

  testApiRequest(): void {
    if (!this.isAuthenticated) return;

    this.dexAuthService
      .makeAuthenticatedRequest({
        endpoint: '/pipeline/apis/v1beta1/pipelines',
        method: 'GET',
      })
      .subscribe({
        next: (response: unknown) => {
          this.apiResponse = response;
          this.apiResponseText = JSON.stringify(response, null, 2);
        },
        error: (err) => {
          this.error = err.message || 'API request failed';
        },
      });
  }

  clearSession(): void {
    this.dexAuthService.clearSession();
    this.updateAuthState();
    this.apiResponse = null;
    this.error = null;
    this.resetSteps();
    this.updateProgressDisplay();
  }

  private updateAuthState(): void {
    const session = this.dexAuthService.getSession();
    this.isAuthenticated = !!session;

    if (session) {
      this.authState = { sessionCookie: session };
    } else {
      this.authState = {};
    }
  }

  private resetSteps(): void {
    this.authSteps.forEach((step) => {
      step.status = 'pending';
      step.error = null;
    });
    this.currentStep = 0;
  }

  private setStepStatus(
    stepId: string,
    status: 'pending' | 'active' | 'completed' | 'error',
    error?: string
  ): void {
    const step = this.authSteps.find((s) => s.id === stepId);
    if (step) {
      step.status = status;
      step.error = error || null;

      if (status === 'completed') {
        this.currentStep = Math.max(this.currentStep, step.order);
      } else if (status === 'active') {
        this.currentStep = step.order;
      }
    }
  }

  private updateProgressDisplay(): void {
    this.progressPercentage = (this.currentStep / this.totalSteps) * 100;
  }

  private handleAuthError(error: any): void {
    const errorMessage = error.message || 'Unknown error';
    let currentActiveStep = this.authSteps.find((s) => s.status === 'active');

    if (!currentActiveStep) {
      const completedSteps = this.authSteps.filter(
        (s) => s.status === 'completed'
      );
      const nextStepOrder = completedSteps.length + 1;
      currentActiveStep = this.authSteps.find((s) => s.order === nextStepOrder);
    }

    if (currentActiveStep) {
      this.setStepStatus(currentActiveStep.id, 'error', errorMessage);
    } else {
      this.setStepStatus('credentials', 'error', errorMessage);
    }

    this.updateProgressDisplay();
  }

  trackByStepId(index: number, step: any): string {
    return step.id;
  }
}
