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
  selector: 'app-register',
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <div hlmCard class="w-full max-w-md space-y-8 p-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold">Create your account</h2>
        </div>
        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
        >
          <div class="space-y-4">
            <hlm-form-field>
              <label hlmLabel for="name">Full name</label>
              <input
                hlmInput
                id="name"
                name="name"
                type="text"
                formControlName="name"
                required
                placeholder="Enter your full name"
              />
            </hlm-form-field>

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

            <hlm-form-field>
              <label hlmLabel for="confirmPassword">Confirm password</label>
              <input
                hlmInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                required
                placeholder="Confirm your password"
              />
            </hlm-form-field>
          </div>

          <div>
            <button
              hlmBtn
              type="submit"
              [disabled]="registerForm.invalid"
              variant="default"
              class="w-full"
            >
              Create account
            </button>
          </div>

          <div class="text-center text-sm">
            <span class="text-muted-foreground">Already have an account?</span>
            <a
              routerLink="/auth/login"
              class="ml-1 text-primary hover:text-primary/80"
            >
              Sign in
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
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.authService.register(name, email, password).subscribe({
        next: () => {
          this.router.navigate(['/private/dashboard']);
        },
        error: (error: Error) => {
          console.error('Registration failed:', error);
        },
      });
    }
  }
}
