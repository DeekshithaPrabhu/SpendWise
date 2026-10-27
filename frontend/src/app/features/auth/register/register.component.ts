import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen grid place-items-center">
      <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 class="text-2xl font-bold">Create your account</h1>
        @if (error()) { <p class="text-sm text-red-600">{{ error() }}</p> }
        <input formControlName="name" placeholder="Name" class="w-full border rounded p-2" />
        <input formControlName="email" type="email" placeholder="Email" class="w-full border rounded p-2" />
        <input formControlName="password" type="password" placeholder="Password (min 6)" class="w-full border rounded p-2" />
        <button [disabled]="form.invalid" class="w-full bg-brand-600 text-white rounded p-2 disabled:opacity-50">Register</button>
        <p class="text-sm text-center">Have an account? <a routerLink="/login" class="text-brand-600">Login</a></p>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => this.error.set(e.error?.message || 'Registration failed'),
    });
  }
}
