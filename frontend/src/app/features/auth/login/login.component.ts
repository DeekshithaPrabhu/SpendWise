import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen grid place-items-center">
      <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 class="text-2xl font-bold">Welcome back</h1>
        @if (error()) { <p class="text-sm text-red-600">{{ error() }}</p> }
        <input formControlName="email" type="email" placeholder="Email" class="w-full border rounded p-2" />
        <input formControlName="password" type="password" placeholder="Password" class="w-full border rounded p-2" />
        <button [disabled]="form.invalid" class="w-full bg-brand-600 text-white rounded p-2 disabled:opacity-50">Login</button>
        <p class="text-sm text-center">No account? <a routerLink="/register" class="text-brand-600">Register</a></p>
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
      error: (e) => this.error.set(e.error?.message || 'Login failed'),
    });
  }
}
