import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="grid min-h-screen place-items-center px-6">
      <app-theme-toggle class="fixed right-4 top-4" />
      <form [formGroup]="form" (ngSubmit)="submit()" class="w-full max-w-sm space-y-5">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-semibold">Create your account</h1>
          <p class="mt-2 text-apple-muted">Start tracking in under a minute.</p>
        </div>
        @if (error()) { <p class="rounded-xl bg-apple-red/10 px-4 py-3 text-sm text-apple-red">{{ error() }}</p> }
        <input formControlName="name" placeholder="Name" class="input" />
        <input formControlName="email" type="email" placeholder="Email" class="input" />
        <input formControlName="password" type="password" placeholder="Password (min 6 characters)" class="input" />
        <button [disabled]="form.invalid" class="btn-primary w-full !py-3">Create account</button>
        <p class="text-center text-sm text-apple-muted">
          Already have an account? <a routerLink="/login" class="link">Sign in</a>
        </p>
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
