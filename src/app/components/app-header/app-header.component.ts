import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { BreadcrumbItem } from '../../shared/models';
import {
  generateBreadcrumbs,
  getPageTitle,
} from '../../shared/utils/navigation.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslocoModule, NgIcon, HlmIconDirective, NgFor, NgIf],
  templateUrl: './app-header.component.html',
  providers: [
    provideIcons({
      lucideChevronRight,
    }),
  ],
})
export class AppHeaderComponent {
  currentRoute: string | null = null;
  breadcrumbs: BreadcrumbItem[] = [];
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
    this.breadcrumbs = generateBreadcrumbs(url);
  }

  getTranslationWithFallback(key: string, fallback: string): string {
    const translationKey = `section.${key}`;
    const translation = this.translocoService.translate(translationKey);
    return translation === translationKey ? fallback : translation;
  }
}
