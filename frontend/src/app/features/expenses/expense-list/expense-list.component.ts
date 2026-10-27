import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { Category, Expense } from '../../../core/models';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="mb-8 flex items-end">
      <h1 class="text-5xl font-semibold">Expenses</h1>
      <a routerLink="/expenses/new" class="btn-primary ml-auto">Add expense</a>
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
        <p class="p-12 text-center text-apple-muted">Nothing here yet. Add your first expense.</p>
      }
    </div>
  `,
})
export class ExpenseListComponent implements OnInit {
  private service = inject(ExpenseService);
  expenses = signal<Expense[]>([]);

  ngOnInit() { this.load(); }
  load() { this.service.getAll().subscribe((r) => this.expenses.set(r)); }
  remove(id: string) { this.service.remove(id).subscribe(() => this.load()); }
  cat(e: Expense): Category | null { return typeof e.category === 'string' ? null : e.category; }
}
