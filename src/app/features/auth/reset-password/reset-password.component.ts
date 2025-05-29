import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <div hlmCard class="w-full max-w-md space-y-8 p-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold">Set new password</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>
        <form
          [formGroup]="resetPasswordForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
        >
          <div class="space-y-4">
            <hlm-form-field>
              <label hlmLabel for="password">New password</label>
              <input
                hlmInput
                id="password"
                name="password"
                type="password"
                formControlName="password"
                required
                placeholder="Enter new password"
              />
            </hlm-form-field>

            <hlm-form-field>
              <label hlmLabel for="confirmPassword">Confirm new password</label>
              <input
                hlmInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                required
                placeholder="Confirm new password"
              />
            </hlm-form-field>
          </div>

          <div>
            <button
              hlmBtn
              type="submit"
              [disabled]="resetPasswordForm.invalid"
              variant="default"
              class="w-full"
            >
              Reset password
            </button>
          </div>

          <div class="text-center text-sm">
            <a
              routerLink="/auth/login"
              class="text-primary hover:text-primary/80"
            >
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    HlmButtonDirective,
    HlmCardDirective,
    HlmFormFieldComponent,
    HlmInputDirective,
    HlmLabelDirective,
  ],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const token = this.route.snapshot.queryParams['token'];
      const { password } = this.resetPasswordForm.value;
      this.authService.resetPassword(token, password).subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error: Error) => {
          console.error('Password reset failed:', error);
        },
      });
    }
  }
}
