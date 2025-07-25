import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import {
  BrnSheetContentDirective,
  BrnSheetTriggerDirective,
} from '@spartan-ng/brain/sheet';
import {
  HlmSheetComponent,
  HlmSheetContentComponent,
  HlmSheetDescriptionDirective,
  HlmSheetFooterComponent,
  HlmSheetHeaderComponent,
  HlmSheetTitleDirective,
} from '@spartan-ng/ui-sheet-helm';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoModule,
    NgIcon,
    HlmIconDirective,
    NgFor,
    NgIf,
    HlmSheetComponent,
    HlmSheetContentComponent,
    HlmSheetDescriptionDirective,
    HlmSheetFooterComponent,
    HlmSheetHeaderComponent,
    HlmSheetTitleDirective,
    BrnSheetTriggerDirective,
    BrnSheetContentDirective,
  ],
  templateUrl: './app-sheet.component.html',
  providers: [
    provideIcons({
      lucideChevronRight,
    }),
  ],
})
export class AppSheetComponent {
  @Input() items: any[] = [];
  @Input() struct: any[] = [];
  constructor(private router: Router) {}
}
