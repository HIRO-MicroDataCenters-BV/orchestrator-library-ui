import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmTableDirective } from '@spartan-ng/ui-table-helm';
import {
  HlmAccordionDirective,
  HlmAccordionItemDirective,
  HlmAccordionTriggerDirective,
  HlmAccordionContentComponent,
} from '@spartan-ng/ui-accordion-helm';
import { HlmCheckboxComponent } from '@spartan-ng/ui-checkbox-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import { HlmSwitchComponent } from '@spartan-ng/ui-switch-helm';
// Удален импорт HlmTabs
import { BrnProgressComponent } from '@spartan-ng/brain/progress';
import {
  HlmProgressDirective,
  HlmProgressIndicatorDirective,
} from '@spartan-ng/ui-progress-helm';
import {
  HlmCardDirective,
  HlmCardHeaderDirective,
  HlmCardFooterDirective,
  HlmCardTitleDirective,
  HlmCardDescriptionDirective,
  HlmCardContentDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import {
  HlmAlertDirective,
  HlmAlertDescriptionDirective,
  HlmAlertTitleDirective,
  HlmAlertIconDirective,
} from '@spartan-ng/ui-alert-helm';
import {
  BrnAvatarComponent,
  BrnAvatarFallbackDirective,
  BrnAvatarImageDirective,
} from '@spartan-ng/brain/avatar';
import {
  HlmAvatarComponent,
  HlmAvatarFallbackDirective,
  HlmAvatarImageDirective,
} from '@spartan-ng/ui-avatar-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { AppCircleProgressComponent } from '../../components/app-circle-progress/app-circle-progress.component';
import { ApiExampleComponent } from '../../components/api-example/api-example.component';

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
    // Удалены импорты HlmTabs
    BrnProgressComponent,
    HlmProgressDirective,
    HlmProgressIndicatorDirective,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardFooterDirective,
    HlmCardTitleDirective,
    HlmCardDescriptionDirective,
    HlmCardContentDirective,
    HlmBadgeDirective,
    HlmAlertDirective,
    HlmAlertDescriptionDirective,
    HlmAlertTitleDirective,
    HlmAlertIconDirective,
    BrnAvatarComponent,
    AppCircleProgressComponent,
    BrnAvatarFallbackDirective,
    BrnAvatarImageDirective,
    HlmAvatarComponent,
    HlmAvatarFallbackDirective,
    HlmAvatarImageDirective,
    HlmSeparatorDirective,
    ApiExampleComponent,
  ],
  templateUrl: './ui-kit.component.html',
})
export class UiKitComponent {}
