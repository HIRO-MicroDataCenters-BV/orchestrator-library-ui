import { Component, inject } from '@angular/core';
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
  lucideSiren,
  lucideChartColumnStacked,
  lucideCog,
  lucideChevronDown,
  lucideChevronRight,
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
import { ApiService } from '../../core/services/api.service';

interface MenuItem {
  label: string | null;
  icon: string | null;
  route: string;
  items?: MenuItem[];
  expanded?: boolean;
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
      lucideSiren,
      lucideCog,
      lucideChartColumnStacked,
      lucideChevronDown,
      lucideChevronRight,
    }),
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  currentRoute: string | null = null;
  showSubmenuOnHover: MenuItem | null = null;
  menuItems: MenuItem[] = [
    {
      label: null,
      icon: null,
      route: '',
      items: [
        { label: 'cog', icon: 'lucideCog', route: '/cog' },
        { label: 'k8s', icon: 'lucideLayoutDashboard', route: '/k8s' },
      ],
    },
    {
      label: null,
      icon: null,
      route: '/emdc',
      items: [
        {
          label: 'workloads',
          icon: 'lucideLayers',
          route: '/workloads',
          items: [
            {
              label: 'request_decisions',
              icon: null,
              route: '/request_decisions',
            },
            { label: 'actions', icon: null, route: '/actions' },
          ],
        },
        { label: 'alerts', icon: 'lucideSiren', route: '/alerts' },
        {
          label: 'monitoring',
          icon: 'lucideChartColumnStacked',
          route: '/monitoring',
        },
      ],
    },
  ];

  constructor(
    public sidebarService: HlmSidebarService,
    private readonly apiService: ApiService
  ) {
    const namespace = 'hiros';
    const serviceAccountName = 'readonly-user';
    this.apiService.getK8sToken(namespace, serviceAccountName).subscribe();
  }

  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  onMenuItemHover(item: MenuItem): void {
    if (
      this.sidebarService.state() === 'collapsed' &&
      item.items &&
      item.items.length > 0
    ) {
      this.showSubmenuOnHover = item;
    }
  }

  onMenuItemLeave(): void {
    if (this.sidebarService.state() === 'collapsed') {
      this.showSubmenuOnHover = null;
    }
  }
}
