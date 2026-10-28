import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, PercentPipe, RouterLink],
  template: `
    <section class="mb-12">
      <p class="eyebrow">{{ now | date: 'MMMM y' }}</p>
      <h1 class="mt-2 text-5xl font-semibold leading-tight md:text-6xl">
        Hello, {{ firstName() }}.<br />
        <span class="text-apple-muted">Here's your spending.</span>
      </h1>
    </section>

    @if (error()) {
      <p class="card text-apple-red">Couldn't load your summary. Please try again.</p>
    } @else {
      @if (summary(); as s) {
      <div class="grid gap-5 md:grid-cols-2">
        <div class="card card-hover">
          <p class="eyebrow">This month</p>
          <p class="mt-3 text-5xl font-semibold tracking-tight">{{ s.totalThisMonth | currency: 'INR' : 'symbol' : '1.0-0' }}</p>
          <p class="mt-2 text-sm text-apple-muted">Total expenses so far</p>
        </div>

        <div class="card card-hover">
          <p class="eyebrow">Today</p>
          <p class="mt-3 text-5xl font-semibold tracking-tight">{{ s.totalToday | currency: 'INR' : 'symbol' : '1.0-0' }}</p>
          <p class="mt-2 text-sm text-apple-muted">Spent since midnight</p>
        </div>

        <div class="card card-hover">
          <p class="eyebrow">Daily average</p>
          <p class="mt-3 text-5xl font-semibold tracking-tight">{{ s.averageDaily | currency: 'INR' : 'symbol' : '1.0-0' }}</p>
          <p class="mt-2 text-sm text-apple-muted">Across {{ s.daysElapsed }} {{ s.daysElapsed === 1 ? 'day' : 'days' }} this month</p>
        </div>

        <div class="card card-hover">
          <p class="eyebrow">Top category</p>
          @if (s.highestCategory; as c) {
            <p class="mt-3 flex items-center gap-3 text-5xl font-semibold tracking-tight">
              <span class="text-4xl">{{ c.icon }}</span>{{ c.name }}
            </p>
            <p class="mt-2 text-sm text-apple-muted">
              {{ c.total | currency: 'INR' : 'symbol' : '1.0-0' }} · {{ c.share | percent: '1.0-0' }} of this month
            </p>
            <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-fill/5">
              <div class="h-full rounded-full" [style.width.%]="c.share * 100" [style.background]="c.color"></div>
            </div>
          } @else {
            <p class="mt-3 text-5xl font-semibold tracking-tight text-apple-border">—</p>
            <p class="mt-2 text-sm text-apple-muted">No expenses this month yet</p>
          }
        </div>
      </div>

      <div class="mt-10 text-center">
        <a routerLink="/expenses/new" class="btn-primary !px-7 !py-3 !text-base">Add an expense</a>
      </div>
      } @else {
      <div class="grid gap-5 md:grid-cols-2">
        @for (i of [1, 2, 3, 4]; track i) {
          <div class="card h-44 animate-pulse bg-surface/60"></div>
        }
      </div>
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);
  private auth = inject(AuthService);

  now = new Date();
  summary = signal<DashboardSummary | null>(null);
  error = signal(false);

  firstName = () => this.auth.user()?.name?.split(' ')[0] ?? 'there';

  ngOnInit() {
    this.service.getSummary().subscribe({
      next: (s) => this.summary.set(s),
      error: () => this.error.set(true),
    });
  }
}
