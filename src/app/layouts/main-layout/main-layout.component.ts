import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHouse,
  lucideLayers,
  lucideMenu,
  lucideUser,
  lucideLogOut,
  lucideSearch,
  lucideHardDrive,
  lucideServer,
  lucideLayoutDashboard,
} from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
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
  HlmSidebarService,
} from '@spartan-ng/ui-sidebar-helm';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string | null;
  route: string;
  items?: MenuItem[];
}

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
    HlmInputDirective,
    AppHeaderComponent,
    NgIf,
    NgFor,
  ],
  providers: [
    provideIcons({
      lucideHouse,
      lucideLayers,
      lucideMenu,
      lucideUser,
      lucideLogOut,
      lucideSearch,
      lucideHardDrive,
      lucideServer,
      lucideLayoutDashboard,
    }),
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  currentUser: User | null = null;
  currentRoute: string | null = null;
  menuItems: MenuItem[] = [
    {
      label: 'emdc',
      icon: null,
      route: '/emdc',
      items: [
        { label: 'clusters', icon: 'lucideServer', route: '/clusters' },
        { label: 'workloads', icon: 'lucideLayers', route: '/workloads' },
        { label: 'nodes', icon: 'lucideHardDrive', route: '/nodes' },
      ],
    },
  ];

  constructor(public sidebarService: HlmSidebarService) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
