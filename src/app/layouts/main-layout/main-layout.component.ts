import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideLayers, lucideMenu, lucideUser, lucideLogOut } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmSidebarComponent,
  HlmSidebarContentDirective,
  HlmSidebarTriggerComponent,
  HlmSidebarHeaderDirective,
  HlmSidebarMenuDirective,
  HlmSidebarMenuItemDirective,
  HlmSidebarMenuButtonDirective,
  HlmSidebarFooterDirective,
  HlmSidebarSeparatorDirective,
  HlmSidebarService
} from '@spartan-ng/ui-sidebar-helm';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoModule,
    NgIcon,
    HlmIconDirective,
    HlmSidebarComponent,
    HlmSidebarContentDirective,
    HlmSidebarTriggerComponent,
    HlmSidebarHeaderDirective,
    HlmSidebarMenuDirective,
    HlmSidebarMenuItemDirective,
    HlmSidebarMenuButtonDirective,
    HlmSidebarFooterDirective,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    HlmButtonDirective,
    NgIf
  ],
  providers: [provideIcons({ lucideHouse, lucideLayers, lucideMenu, lucideUser, lucideLogOut })],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  currentUser: User | null = null;
  
  constructor(public sidebarService: HlmSidebarService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  logout(): void {
    this.authService.logout();
  }
}