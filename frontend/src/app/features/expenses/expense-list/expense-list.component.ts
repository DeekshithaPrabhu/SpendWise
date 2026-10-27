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
    <div class="flex items-center mb-4">
      <h1 class="text-2xl font-bold">Expenses</h1>
      <a routerLink="/expenses/new" class="ml-auto bg-brand-600 text-white px-3 py-2 rounded">+ Add expense</a>
    </div>
    <div class="bg-white rounded-xl shadow divide-y">
      @for (e of expenses(); track e._id) {
        <div class="flex items-center p-3 gap-4">
          <div class="flex-1">
            <p class="font-medium">{{ e.title }}</p>
            <p class="text-xs text-slate-500">{{ e.date | date: 'mediumDate' }} · {{ categoryName(e) }}</p>
          </div>
          <span class="font-semibold">{{ e.amount | currency: 'INR' }}</span>
          <a [routerLink]="['/expenses', e._id, 'edit']" class="text-sm text-brand-600">Edit</a>
          <button (click)="remove(e._id)" class="text-sm text-red-600">Delete</button>
        </div>
      } @empty {
        <p class="p-6 text-center text-slate-500">No expenses yet.</p>
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
  categoryName(e: Expense) { return typeof e.category === 'string' ? '' : (e.category as Category).name; }
}
