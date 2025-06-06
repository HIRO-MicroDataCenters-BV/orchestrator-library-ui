import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmTableDirective } from '@spartan-ng/ui-table-helm';
import { HlmAccordionDirective, HlmAccordionItemDirective, HlmAccordionTriggerDirective, HlmAccordionContentComponent } from '@spartan-ng/ui-accordion-helm';
import { HlmCheckboxComponent } from '@spartan-ng/ui-checkbox-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import { HlmSwitchComponent } from '@spartan-ng/ui-switch-helm';
import { HlmTabsComponent, HlmTabsListComponent, HlmTabsTriggerDirective, HlmTabsContentDirective } from '@spartan-ng/ui-tabs-helm';
import { BrnProgressComponent } from '@spartan-ng/brain/progress';
import { HlmProgressDirective, HlmProgressIndicatorDirective } from '@spartan-ng/ui-progress-helm';
import { HlmCardDirective, HlmCardHeaderDirective, HlmCardFooterDirective, HlmCardTitleDirective, HlmCardDescriptionDirective, HlmCardContentDirective } from '@spartan-ng/ui-card-helm';
import { HlmDialogComponent, HlmDialogContentComponent, HlmDialogHeaderComponent, HlmDialogFooterComponent, HlmDialogTitleDirective, HlmDialogDescriptionDirective, HlmDialogCloseDirective, HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmAlertDirective, HlmAlertDescriptionDirective, HlmAlertTitleDirective, HlmAlertIconDirective } from '@spartan-ng/ui-alert-helm';
import { BrnAvatarComponent, BrnAvatarFallbackDirective, BrnAvatarImageDirective } from '@spartan-ng/brain/avatar';
import { HlmAvatarComponent, HlmAvatarFallbackDirective, HlmAvatarImageDirective } from '@spartan-ng/ui-avatar-helm';

@Component({
  selector: 'app-ui-kit',
  standalone: true,
  imports: [
    TranslocoModule,
    HlmButtonDirective,
    HlmInputDirective,
    HlmTableDirective,
    HlmAccordionDirective,
    HlmAccordionItemDirective,
    HlmAccordionTriggerDirective,
    HlmAccordionContentComponent,
    HlmCheckboxComponent,
    HlmSkeletonComponent,
    HlmSwitchComponent,
    HlmTabsComponent,
    HlmTabsListComponent,
    HlmTabsTriggerDirective,
    HlmTabsContentDirective,
    BrnProgressComponent,
    HlmProgressDirective,
    HlmProgressIndicatorDirective,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardFooterDirective,
    HlmCardTitleDirective,
    HlmCardDescriptionDirective,
    HlmCardContentDirective,
    HlmDialogComponent,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmDialogCloseDirective,
    HlmBadgeDirective,
    HlmAlertDirective,
    HlmAlertDescriptionDirective,
    HlmAlertTitleDirective,
    HlmAlertIconDirective,
    BrnAvatarComponent,
    BrnAvatarFallbackDirective,
    BrnAvatarImageDirective,
    HlmAvatarComponent,
    HlmAvatarFallbackDirective,
    HlmAvatarImageDirective,
  ],
  templateUrl: './ui-kit.component.html'
})
export class UiKitComponent {
  private readonly _dialogService = inject(HlmDialogService);

  openDialog() {
    this._dialogService.open(HlmDialogContentComponent, {
      contentClass: 'sm:max-w-[425px]',
      context: {
        $implicit: {
          title: 'Dialog Title',
          description: 'Dialog Description'
        }
      }
    });
  }
}