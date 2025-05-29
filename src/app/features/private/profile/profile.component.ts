import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div hlmCard class="p-6">
          <h1 class="text-2xl font-bold mb-6">Profile Settings</h1>
          <form
            [formGroup]="profileForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <hlm-form-field>
              <label hlmLabel for="name">Full Name</label>
              <input hlmInput id="name" type="text" formControlName="name" />
            </hlm-form-field>

            <hlm-form-field>
              <label hlmLabel for="email">Email</label>
              <input hlmInput id="email" type="email" formControlName="email" />
            </hlm-form-field>

            <div class="space-y-4">
              <h2 class="text-xl font-semibold">Change Password</h2>
              <hlm-form-field>
                <label hlmLabel for="currentPassword">Current Password</label>
                <input
                  hlmInput
                  id="currentPassword"
                  type="password"
                  formControlName="currentPassword"
                />
              </hlm-form-field>

              <hlm-form-field>
                <label hlmLabel for="newPassword">New Password</label>
                <input
                  hlmInput
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                />
              </hlm-form-field>

              <hlm-form-field>
                <label hlmLabel for="confirmPassword"
                  >Confirm New Password</label
                >
                <input
                  hlmInput
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                />
              </hlm-form-field>
            </div>

            <div class="flex gap-4">
              <button hlmBtn type="submit" variant="default">
                Save Changes
              </button>
              <button
                hlmBtn
                type="button"
                variant="outline"
                (click)="onCancel()"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmButtonDirective,
    HlmCardDirective,
    HlmFormFieldComponent,
    HlmInputDirective,
    HlmLabelDirective,
  ],
})
export class ProfileComponent {
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        currentPassword: [''],
        newPassword: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
      },
      { validator: this.passwordMatchValidator }
    );

    // Load user data
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    if (!newPassword && !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.profileForm.valid) {
      // TODO: Implement profile update logic
      console.log(this.profileForm.value);
    }
  }

  onCancel() {
    // Reset form to initial values
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    });
  }
}
