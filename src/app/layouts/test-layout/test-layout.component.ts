import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Spartan UI imports
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';


@Component({
  selector: 'app-test-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ...HlmCardImports,
    HlmButtonDirective,
    HlmBadgeDirective,

  ],
  template: `
    <div class="h-screen bg-gray-50 flex flex-col">
      <!-- Header -->
      <header class="border-b bg-white shadow-sm">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-gray-900">Test Dashboard</h1>
              <span hlmBadge variant="outline" class="text-xs">DEV</span>
            </div>

            <!-- Navigation -->
            <nav class="flex space-x-2">
              <a
                routerLink="/test/dex"
                routerLinkActive="bg-blue-100 text-blue-700"
                hlmBtn
                variant="ghost"
                size="sm"
                class="transition-colors"
              >
                DEX Auth
              </a>
              <a
                routerLink="/test/proxy"
                routerLinkActive="bg-blue-100 text-blue-700"
                hlmBtn
                variant="ghost"
                size="sm"
                class="transition-colors"
              >
                Proxy Test
              </a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-6 py-8 flex-1 overflow-auto">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="border-t bg-white mt-auto">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div>
              Test Environment -
              <span class="font-medium">{{ currentTime | date:'medium' }}</span>
            </div>
            <div class="flex items-center space-x-4">
              <span hlmBadge variant="secondary" class="text-xs">
                Status: {{ connectionStatus }}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class TestLayoutComponent {
  currentTime = new Date();
  connectionStatus = 'Online';

  constructor() {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }
}
