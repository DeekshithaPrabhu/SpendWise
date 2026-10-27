import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-20 border-b border-black/5 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <nav class="mx-auto flex h-12 max-w-5xl items-center gap-8 px-6 text-[13px]">
        <a routerLink="/dashboard" class="text-[15px] font-semibold tracking-tight">SpendWise</a>
        <a routerLink="/dashboard" routerLinkActive="!text-apple-text" class="text-apple-muted transition hover:text-apple-text">Dashboard</a>
        <a routerLink="/expenses" routerLinkActive="!text-apple-text" class="text-apple-muted transition hover:text-apple-text">Expenses</a>
        <a routerLink="/categories" routerLinkActive="!text-apple-text" class="text-apple-muted transition hover:text-apple-text">Categories</a>
        <button class="ml-auto text-apple-muted transition hover:text-apple-text" (click)="auth.logout()">Sign out</button>
      </nav>
    </header>
    <main class="mx-auto max-w-5xl px-6 pb-24 pt-12">
      <router-outlet />
    </main>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
}
