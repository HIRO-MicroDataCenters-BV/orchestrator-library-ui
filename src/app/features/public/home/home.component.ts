import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { navigationIcons } from '../../../../assets/icons/navigation';

@Component({
  selector: 'app-home',
  template: `
    <div class="space-y-8">
      <!-- Hero Section -->
      <section class="text-center space-y-4">
        <h1 class="text-4xl font-bold">Welcome to Library</h1>
        <p class="text-xl text-muted-foreground">
          Your digital library management system
        </p>
      </section>

      <!-- Features Grid -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Dashboard Card -->
        <div hlmCard class="p-6 space-y-4">
          <div class="text-2xl text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="navigationIcons.dashboard"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold">Dashboard</h3>
          <p class="text-muted-foreground">
            Access your personalized dashboard with quick stats and recent
            activity.
          </p>
          <a
            routerLink="/private/dashboard"
            hlmBtn
            variant="outline"
            class="w-full"
          >
            Go to Dashboard
          </a>
        </div>

        <!-- Profile Card -->
        <div hlmCard class="p-6 space-y-4">
          <div class="text-2xl text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="navigationIcons.profile"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold">Profile</h3>
          <p class="text-muted-foreground">
            Manage your profile settings and preferences.
          </p>
          <a
            routerLink="/private/profile"
            hlmBtn
            variant="outline"
            class="w-full"
          >
            View Profile
          </a>
        </div>

        <!-- About Card -->
        <div hlmCard class="p-6 space-y-4">
          <div class="text-2xl text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="navigationIcons.books"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold">About</h3>
          <p class="text-muted-foreground">
            Learn more about our library system and its features.
          </p>
          <a routerLink="/public/about" hlmBtn variant="outline" class="w-full">
            Learn More
          </a>
        </div>
      </section>
    </div>
  `,
  standalone: true,
  imports: [RouterModule, HlmButtonDirective, HlmCardDirective],
})
export class HomeComponent {
  navigationIcons = navigationIcons;
}
