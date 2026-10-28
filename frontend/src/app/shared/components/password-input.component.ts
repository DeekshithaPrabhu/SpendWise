import { Component, Input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/** Password field with a show/hide (eye) button. Pass the form control it should bind to. */
let nextId = 0;

@Component({
  selector: 'app-password-input',
  host: { class: 'block' },
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (label) { <label class="field-label" [attr.for]="id">{{ label }}</label> }
    <div class="relative">
      <input
        [id]="id"
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control"
        [placeholder]="placeholder"
        [attr.autocomplete]="autocomplete"
        class="input !pr-12"
      />
      <button
        type="button"
        (click)="visible.set(!visible())"
        [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
        [attr.aria-pressed]="visible()"
        class="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-apple-muted transition hover:bg-fill/10 hover:text-apple-text"
      >
        @if (visible()) {
          <!-- eye-off -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c5.2 0 8.7 4.2 9.8 6.1a1.8 1.8 0 0 1 0 1.8 15.6 15.6 0 0 1-3.2 3.7M6.5 6.6A15.3 15.3 0 0 0 2.2 11.9a1.8 1.8 0 0 0 0 1.8C3.3 15.6 6.8 19 12 19c1.6 0 3-.3 4.3-.9" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        } @else {
          <!-- eye -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.2 12.9a1.8 1.8 0 0 1 0-1.8C3.3 9.2 6.8 5 12 5s8.7 4.2 9.8 6.1a1.8 1.8 0 0 1 0 1.8C20.7 14.8 17.2 19 12 19S3.3 14.8 2.2 12.9z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      </button>
    </div>
  `,
})
export class PasswordInputComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() label = '';
  @Input() placeholder = '';
  readonly id = `pw-${nextId++}`;
  @Input() autocomplete = 'current-password';
  visible = signal(false);
}
