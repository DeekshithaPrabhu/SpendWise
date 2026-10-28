import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, map, merge, of, startWith, switchMap, tap } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseQuery, ExpenseService, ExpenseSort } from '../../../core/services/expense.service';
import { Category, Expense, Paginated } from '../../../core/models';

type Period = 'all' | 'this-month' | 'last-month' | 'month' | 'custom';

interface Filters {
  search: string; category: string; period: Period; month: string; from: string; to: string;
  sort: ExpenseSort; limit: number;
}

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const EMPTY: Paginated<Expense> = { data: [], total: 0, page: 1, limit: 5, totalPages: 1, totalAmount: 0 };

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
      <span>{{ total() }} {{ total() === 1 ? 'expense' : 'expenses' }} · {{ totalAmount() | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
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

    @if (total() > 0) {
      <div class="mt-5 flex flex-wrap items-center justify-between gap-4 px-2 text-sm text-apple-muted">
        <span>Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ total() }}</span>

        @if (totalPages() > 1) {
          <nav class="flex items-center gap-1" aria-label="Pagination">
            <button type="button" class="btn-secondary !px-4 !py-2 disabled:pointer-events-none disabled:opacity-40"
                    [disabled]="page() === 1" (click)="goTo(page() - 1)">‹ Prev</button>

            @for (item of pageItems(); track $index) {
              @if (item === '…') {
                <span class="px-1.5">…</span>
              } @else {
                <button type="button" (click)="goTo($any(item))"
                        [attr.aria-current]="item === page() ? 'page' : null"
                        [class]="item === page()
                          ? 'grid h-9 min-w-9 place-items-center rounded-full bg-apple-blue px-2 text-sm font-medium text-white'
                          : 'grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-medium text-apple-text transition hover:bg-fill/10'">
                  {{ item }}
                </button>
              }
            }

            <button type="button" class="btn-secondary !px-4 !py-2 disabled:pointer-events-none disabled:opacity-40"
                    [disabled]="page() === totalPages()" (click)="goTo(page() + 1)">Next ›</button>
          </nav>
        }

        <label class="flex items-center gap-2">
          Per page
          <select [formControl]="form.controls.limit" class="input !w-auto !py-1.5" aria-label="Rows per page">
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
            <option [ngValue]="50">50</option>
          </select>
        </label>
      </div>
    }
  `,
})
export class ExpenseListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);
  private reload$ = new Subject<void>();

  expenses = signal<Expense[]>([]);
  categories = signal<Category[]>([]);
  active = signal(false);

  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  totalAmount = signal(0);
  private limit = signal(10);

  rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit() + 1));
  rangeEnd = computed(() => Math.min(this.page() * this.limit(), this.total()));

  /** 1 … 4 5 6 … 20 style page list */
  pageItems = computed<(number | '…')[]>(() => {
    const t = this.totalPages();
    const c = this.page();
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    const items: (number | '…')[] = [1];
    const start = Math.max(2, c - 1);
    const end = Math.min(t - 1, c + 1);
    if (start > 2) items.push('…');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < t - 1) items.push('…');
    items.push(t);
    return items;
  });

  private readonly defaults: Filters = {
    search: '', category: '', period: 'all', month: ym(new Date()), from: '', to: '', sort: 'newest', limit: 10,
  };
  form = this.fb.nonNullable.group({ ...this.defaults });

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c));

    // A filter/sort/page-size change goes back to page 1 (debounced while typing);
    // page clicks and deletes just reload the current page.
    const filterChanges$ = this.form.valueChanges.pipe(
      debounceTime(250),
      tap(() => this.page.set(1))
    );

    merge(filterChanges$, this.reload$)
      .pipe(
        startWith(null),
        map(() => this.form.getRawValue()),
        tap((v) => this.active.set(this.isActive(v))),
        switchMap((v) =>
          this.service
            .getAll({ ...this.toQuery(v), page: this.page(), limit: v.limit })
            .pipe(catchError(() => of(EMPTY)))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.expenses.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.totalAmount.set(res.totalAmount);
        this.limit.set(res.limit);
        this.page.set(res.page); // server clamps the page if it no longer exists
      });
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.page.set(p);
    this.reload$.next();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clear() {
    // Reset filters but keep the chosen page size
    this.form.reset({ ...this.defaults, limit: this.form.controls.limit.value });
  }

  remove(id: string) {
    this.service.remove(id).subscribe(() => this.reload$.next());
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
