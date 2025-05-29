import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  template: `
    <nav hlmCard class="border-b bg-background">
      <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="text-xl font-bold">Library</a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex md:items-center md:space-x-4">
            <a
              routerLink="/public/home"
              class="text-foreground hover:text-primary flex items-center gap-2"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home</a
            >
            <a
              routerLink="/public/about"
              class="text-foreground hover:text-primary flex items-center gap-2"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              About</a
            >
            <a
              routerLink="/private/dashboard"
              class="text-foreground hover:text-primary flex items-center gap-2"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard</a
            >
            <a
              routerLink="/private/profile"
              class="text-foreground hover:text-primary flex items-center gap-2"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile</a
            >
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <ng-container *ngIf="!authService.isAuthenticated(); else userMenu">
              <a routerLink="/auth/login" hlmBtn variant="ghost">Login</a>
              <a routerLink="/auth/register" hlmBtn variant="default"
                >Register</a
              >
            </ng-container>
            <ng-template #userMenu>
              <button hlmBtn variant="ghost" (click)="authService.logout()">
                Logout
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  standalone: true,
  imports: [RouterModule, HlmButtonDirective, HlmCardDirective, CommonModule],
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}
