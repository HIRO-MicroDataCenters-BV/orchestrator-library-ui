import { Component, inject, OnInit } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { NgIcon } from '@ng-icons/core';
import { MenuItem } from '../../shared/types/common.types';
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
  lucideCog,
  lucideChartColumnStacked,
  lucideChevronDown,
  lucideChevronRight,
  lucideGrip,
} from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmSidebarComponent } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.component';
import { HlmSidebarContentDirective } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar-content.directive';
import { HlmSidebarTriggerComponent } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar-trigger.component';
import { HlmSidebarHeaderDirective } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar-header.directive';
import { HlmSidebarMenuDirective } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar-menu.directive';
import { HlmSidebarMenuItemDirective } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar-menu-item.directive';
import { HlmSidebarFooterDirective } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar-footer.directive';
import { HlmSidebarService } from '../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { NgIf, NgFor } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

interface Cluster {
  cluster_name: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslocoModule,
    NgIcon,
    HlmIconDirective,
    HlmSidebarComponent,
    HlmSidebarContentDirective,
    HlmSidebarTriggerComponent,
    HlmSidebarHeaderDirective,
    HlmSidebarMenuDirective,
    HlmSidebarMenuItemDirective,
    HlmSidebarFooterDirective,
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
      lucideGrip,
    }),
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  currentRoute: string | null = null;
  showSubmenuOnHover: MenuItem | null = null;
  cluster: Cluster | null = null;

  menuItems: MenuItem[] = [
    {
      label: null,
      icon: null,
      route: '',
      items: [
        {
          label: 'overview',
          icon: 'lucideGrip',
          route: '/overview',
        },
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
  ) {}

  ngOnInit(): void {
    // Only fetch token in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getClusterInfo().subscribe((res) => {
        if (res) {
          this.cluster = res;
        }
      });
    }
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
