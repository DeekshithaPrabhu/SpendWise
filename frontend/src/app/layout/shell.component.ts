import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white border-b">
      <nav class="max-w-5xl mx-auto flex items-center gap-6 p-4">
        <span class="font-bold text-brand-600 text-lg">SpendWise</span>
        <a routerLink="/dashboard" routerLinkActive="text-brand-600 font-medium">Dashboard</a>
        <a routerLink="/expenses" routerLinkActive="text-brand-600 font-medium">Expenses</a>
        <a routerLink="/categories" routerLinkActive="text-brand-600 font-medium">Categories</a>
        <button class="ml-auto text-sm text-slate-500 hover:text-red-600" (click)="auth.logout()">Logout</button>
      </nav>
    </header>
    <main class="max-w-5xl mx-auto p-4"><router-outlet /></main>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
}
