import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterLink,
} from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';

export interface BreadcrumbsItem {
  label: string;
  url: string | null;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    TranslocoModule,
    NgIcon,
    HlmIconDirective,
    NgTemplateOutlet,
    NgFor,
    NgIf,
  ],
  templateUrl: './app-header.component.html',
  providers: [
    provideIcons({
      lucideChevronRight,
    }),
  ],
})
export class AppHeaderComponent {
  currentRoute: string | null = null;
  breadcrumbs: BreadcrumbsItem[] = [];
  private translocoService = inject(TranslocoService);

  constructor(private router: Router) {
    this.router.events
      .pipe(
        startWith(this.router.url),
        filter(
          (event) => typeof event === 'string' || event instanceof NavigationEnd
        ),
        map(() => this.router.url),
        distinctUntilChanged()
      )
      .subscribe((url) => {
        this.generateBreadcrumbs(url);
      });
  }

  private generateBreadcrumbs(url: string): void {
    const segments = url.split('/').filter((segment) => segment.length > 0);
    this.breadcrumbs = [];
    if (segments.length === 0) {
      return;
    }
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      const isLastSegment = i === segments.length - 1;
      this.breadcrumbs.push({
        label: segment,
        url: isLastSegment ? null : currentPath,
      });
    }
  }

  getTranslationWithFallback(key: string, fallback: string): string {
    const translationKey = `section.${key}`;
    const translation = this.translocoService.translate(translationKey);
    return translation === translationKey ? fallback : translation;
  }
}
