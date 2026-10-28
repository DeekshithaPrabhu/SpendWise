import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PasswordInputComponent } from '../../../shared/components/password-input.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle.component';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent, PasswordInputComponent],
  template: `
    <div class="grid min-h-screen place-items-center px-6">
      <app-theme-toggle class="fixed right-4 top-4" />
      <form [formGroup]="form" (ngSubmit)="submit()" class="w-full max-w-sm space-y-5">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-semibold">Choose a new password</h1>
          <p class="mt-2 text-apple-muted">Use at least 6 characters.</p>
        </div>

        @if (error()) {
          <p class="rounded-xl bg-apple-red/10 px-4 py-3 text-sm text-apple-red">
            {{ error() }} <a routerLink="/forgot-password" class="link">Request a new link</a>
          </p>
        }

        <app-password-input label="New password" [control]="form.controls.password" placeholder="At least 6 characters" autocomplete="new-password" />
        <app-password-input label="Confirm new password" [control]="form.controls.confirm" placeholder="Re-enter your password" autocomplete="new-password" />
        @if (form.hasError('mismatch') && form.controls.confirm.dirty) {
          <p class="-mt-2 text-sm text-apple-red">Passwords don't match.</p>
        }

        <button [disabled]="form.invalid || loading()" class="btn-primary w-full !py-3">
          {{ loading() ? 'Saving…' : 'Update password' }}
        </button>
      </form>
    </div>
  `,
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  submit() {
    this.loading.set(true);
    this.error.set('');
    const token = this.route.snapshot.paramMap.get('token')!;
    this.auth.resetPassword(token, this.form.getRawValue().password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.loading.set(false); this.error.set(e.error?.message || 'Could not reset your password.'); },
    });
  }
}
