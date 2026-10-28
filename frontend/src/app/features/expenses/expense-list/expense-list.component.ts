import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, startWith, switchMap, tap } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseQuery, ExpenseService, ExpenseSort } from '../../../core/services/expense.service';
import { Category, Expense } from '../../../core/models';

type Period = 'all' | 'this-month' | 'last-month' | 'month' | 'custom';

interface Filters {
  search: string; category: string; period: Period; month: string; from: string; to: string; sort: ExpenseSort;
}

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    <div class="mb-8 flex items-end">
      <h1 class="text-5xl font-semibold">Expenses</h1>
      <a routerLink="/expenses/new" class="btn-primary ml-auto">Add expense</a>
    </div>

    <form [formGroup]="form" class="card mb-6 space-y-3 !p-4">
      <input formControlName="search" type="search" placeholder="Search by title" class="input" />

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select formControlName="category" class="input" aria-label="Category">
          <option value="">All categories</option>
          @for (c of categories(); track c._id) { <option [value]="c._id">{{ c.icon }} {{ c.name }}</option> }
        </select>

        <select formControlName="period" class="input" aria-label="Period">
          <option value="all">All time</option>
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="month">Pick a month…</option>
          <option value="custom">Custom range…</option>
        </select>

        <select formControlName="sort" class="input" aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>
      </div>

      @if (form.controls.period.value === 'month') {
        <input formControlName="month" type="month" class="input sm:max-w-xs" aria-label="Month" />
      }
      @if (form.controls.period.value === 'custom') {
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="field-label">From</label>
            <input formControlName="from" type="date" class="input" />
          </div>
          <div>
            <label class="field-label">To</label>
            <input formControlName="to" type="date" class="input" />
          </div>
        </div>
      }
    </form>

    <div class="mb-3 flex items-center px-2 text-sm text-apple-muted">
      <span>{{ expenses().length }} {{ expenses().length === 1 ? 'expense' : 'expenses' }} · {{ total() | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
      @if (active()) {
        <button type="button" (click)="clear()" class="link ml-auto">Clear filters</button>
      }
    </div>

    <div class="card !p-2">
      @for (e of expenses(); track e._id) {
        <div class="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition hover:bg-apple-gray">
          <span class="grid h-11 w-11 place-items-center rounded-full text-xl"
                [style.background]="cat(e)?.color + '22'">{{ cat(e)?.icon || '•' }}</span>
          <div class="flex-1">
            <p class="font-medium">{{ e.title }}</p>
            <p class="text-sm text-apple-muted">{{ e.date | date: 'mediumDate' }} · {{ cat(e)?.name }}</p>
          </div>
          <span class="font-semibold tabular-nums">{{ e.amount | currency: 'INR' }}</span>
          <a [routerLink]="['/expenses', e._id, 'edit']" class="link text-sm">Edit</a>
          <button (click)="remove(e._id)" class="text-sm text-apple-red hover:underline">Delete</button>
        </div>
      } @empty {
        <p class="p-12 text-center text-apple-muted">
          {{ active() ? 'No expenses match your filters.' : 'Nothing here yet. Add your first expense.' }}
        </p>
      }
    </div>
  `,
})
export class ExpenseListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  expenses = signal<Expense[]>([]);
  categories = signal<Category[]>([]);
  active = signal(false);
  total = computed(() => this.expenses().reduce((sum, e) => sum + e.amount, 0));

  private readonly defaults: Filters = {
    search: '', category: '', period: 'all', month: ym(new Date()), from: '', to: '', sort: 'newest',
  };
  form = this.fb.nonNullable.group({ ...this.defaults });

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c));

    // Re-query whenever any filter changes (debounced so typing doesn't spam the API)
    this.form.valueChanges
      .pipe(
        startWith(null),
        debounceTime(250),
        map(() => this.form.getRawValue()),
        tap((v) => this.active.set(this.isActive(v))),
        switchMap((v) => this.service.getAll(this.toQuery(v)).pipe(catchError(() => of([] as Expense[])))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((list) => this.expenses.set(list));
  }

  clear() { this.form.reset(this.defaults); }

  remove(id: string) {
    this.service.remove(id).subscribe(() => this.expenses.update((l) => l.filter((e) => e._id !== id)));
  }

  cat(e: Expense): Category | null { return typeof e.category === 'string' ? null : e.category; }

  private isActive(v: Filters) {
    return !!(v.search.trim() || v.category || v.period !== 'all' || v.sort !== 'newest');
  }

  private toQuery(v: Filters): ExpenseQuery {
    const q: ExpenseQuery = { search: v.search.trim(), category: v.category, sort: v.sort };
    const now = new Date();
    switch (v.period) {
      case 'this-month': q.month = ym(now); break;
      case 'last-month': q.month = ym(new Date(now.getFullYear(), now.getMonth() - 1, 1)); break;
      case 'month': q.month = v.month; break;
      case 'custom': q.from = v.from; q.to = v.to; break;
    }
    return q;
  }
}
