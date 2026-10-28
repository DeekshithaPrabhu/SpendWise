import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle.component';
import { PasswordInputComponent } from '../../../shared/components/password-input.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent, PasswordInputComponent],
  template: `
    <div class="grid min-h-screen place-items-center px-6">
      <app-theme-toggle class="fixed right-4 top-4" />
      <form [formGroup]="form" (ngSubmit)="submit()" class="w-full max-w-sm space-y-5">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-semibold">Sign in to SpendWise</h1>
          <p class="mt-2 text-apple-muted">Know where every rupee goes.</p>
        </div>
        @if (error()) { <p class="rounded-xl bg-apple-red/10 px-4 py-3 text-sm text-apple-red">{{ error() }}</p> }
        <div>
          <label for="login-email" class="field-label">Email</label>
          <input id="login-email" formControlName="email" type="email" placeholder="name@example.com" autocomplete="email" class="input" />
        </div>
        <div>
          <app-password-input label="Password" [control]="form.controls.password" placeholder="Enter your password" autocomplete="current-password" />
          <div class="mt-2 text-right"><a routerLink="/forgot-password" class="link text-sm">Forgot password?</a></div>
        </div>
        <button [disabled]="form.invalid" class="btn-primary w-full !py-3">Continue</button>
        <p class="text-center text-sm text-apple-muted">
          Don't have an account? <a routerLink="/register" class="link">Create yours now</a>
        </p>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => this.error.set(e.error?.message || 'Sign in failed'),
    });
  }
}
