import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="grid min-h-screen place-items-center px-6">
      <app-theme-toggle class="fixed right-4 top-4" />
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-semibold">Reset your password</h1>
          <p class="mt-2 text-apple-muted">Enter your email and we'll send you a link to set a new one.</p>
        </div>

        @if (sent()) {
          <div class="card text-center">
            <p class="text-3xl">📬</p>
            <p class="mt-3 font-medium">Check your inbox</p>
            <p class="mt-1 text-sm text-apple-muted">
              We've sent a reset link to <span class="text-apple-text">{{ form.controls.email.value }}</span>.
              It's valid for 15 minutes.
            </p>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            @if (error()) { <p class="rounded-xl bg-apple-red/10 px-4 py-3 text-sm text-apple-red">{{ error() }}</p> }
            <div>
              <label for="fp-email" class="field-label">Email</label>
              <input id="fp-email" formControlName="email" type="email" placeholder="name@example.com" autocomplete="email" class="input" />
            </div>
            <button [disabled]="form.invalid || loading()" class="btn-primary w-full !py-3">
              {{ loading() ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>
        }

        <p class="mt-6 text-center text-sm"><a routerLink="/login" class="link">‹ Back to sign in</a></p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  sent = signal(false);
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });

  submit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: (e) => { this.loading.set(false); this.error.set(e.error?.message || 'Something went wrong. Please try again.'); },
    });
  }
}
