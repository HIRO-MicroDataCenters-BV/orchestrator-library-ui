import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <div hlmCard class="w-full max-w-md space-y-8 p-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold">Reset your password</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        <form
          [formGroup]="forgotPasswordForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
        >
          <div class="space-y-4">
            <hlm-form-field>
              <label hlmLabel for="email">Email address</label>
              <input
                hlmInput
                id="email"
                name="email"
                type="email"
                formControlName="email"
                required
                placeholder="Enter your email"
              />
            </hlm-form-field>
          </div>

          <div>
            <button
              hlmBtn
              type="submit"
              [disabled]="forgotPasswordForm.invalid"
              variant="default"
              class="w-full"
            >
              Send reset link
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.router.navigate(['/auth/reset-password']);
        },
        error: (error: Error) => {
          console.error('Password reset request failed:', error);
        },
      });
    }
  }
}
