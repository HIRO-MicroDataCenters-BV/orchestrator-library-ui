import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Spartan UI Components
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmAlertDirective } from '@spartan-ng/ui-alert-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmDialogCloseDirective } from '@spartan-ng/ui-dialog-helm';
import { HlmMenuItemDirective } from '@spartan-ng/ui-menu-helm';
import { HlmSelectDirective } from '@spartan-ng/ui-select-helm';
import { HlmTableDirective } from '@spartan-ng/ui-table-helm';

const spartanComponents = [
  HlmButtonDirective,
  HlmCardDirective,
  HlmFormFieldComponent,
  HlmInputDirective,
  HlmLabelDirective,
  HlmAlertDirective,
  HlmBadgeDirective,
  HlmDialogCloseDirective,
  HlmMenuItemDirective,
  HlmSelectDirective,
  HlmTableDirective,
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...spartanComponents,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...spartanComponents,
  ],
})
export class SharedModule {}
