import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen place-items-center px-6">
      <form [formGroup]="form" (ngSubmit)="submit()" class="w-full max-w-sm space-y-5">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-semibold">Sign in to SpendWise</h1>
          <p class="mt-2 text-apple-muted">Know where every rupee goes.</p>
        </div>
        @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-apple-red">{{ error() }}</p> }
        <input formControlName="email" type="email" placeholder="Email" class="input" />
        <input formControlName="password" type="password" placeholder="Password" class="input" />
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
