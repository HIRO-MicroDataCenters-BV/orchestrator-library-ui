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
  selector: 'app-login',
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <div hlmCard class="w-full max-w-md space-y-8 p-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold">Sign in to your account</h2>
        </div>
        <form
          [formGroup]="loginForm"
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

            <hlm-form-field>
              <label hlmLabel for="password">Password</label>
              <input
                hlmInput
                id="password"
                name="password"
                type="password"
                formControlName="password"
                required
                placeholder="Enter your password"
              />
            </hlm-form-field>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <a
                routerLink="/auth/forgot-password"
                class="text-primary hover:text-primary/80"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              hlmBtn
              type="submit"
              [disabled]="loginForm.invalid"
              variant="default"
              class="w-full"
            >
              Sign in
            </button>
          </div>

          <div class="text-center text-sm">
            <span class="text-muted-foreground">Don't have an account?</span>
            <a
              routerLink="/auth/register"
              class="ml-1 text-primary hover:text-primary/80"
            >
              Sign up
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
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/private/dashboard']);
        },
        error: (error: Error) => {
          console.error('Login failed:', error);
        },
      });
    }
  }
}
