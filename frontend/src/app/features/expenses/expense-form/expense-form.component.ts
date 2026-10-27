import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="text-2xl font-bold mb-4">{{ id ? 'Edit' : 'New' }} expense</h1>
    <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white p-6 rounded-xl shadow max-w-md space-y-3">
      <input formControlName="title" placeholder="Title" class="w-full border rounded p-2" />
      <input formControlName="amount" type="number" placeholder="Amount" class="w-full border rounded p-2" />
      <select formControlName="category" class="w-full border rounded p-2">
        <option value="" disabled>Select category</option>
        @for (c of categories(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
      </select>
      <input formControlName="date" type="date" class="w-full border rounded p-2" />
      <select formControlName="paymentMethod" class="w-full border rounded p-2">
        <option value="cash">Cash</option><option value="card">Card</option>
        <option value="upi">UPI</option><option value="bank">Bank</option>
      </select>
      <textarea formControlName="notes" placeholder="Notes" class="w-full border rounded p-2"></textarea>
      <button [disabled]="form.invalid" class="bg-brand-600 text-white rounded px-4 py-2 disabled:opacity-50">Save</button>
    </form>
  `,
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenses = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = this.route.snapshot.paramMap.get('id');
  categories = signal<Category[]>([]);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    paymentMethod: ['cash'],
    notes: [''],
  });

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c));
    if (this.id) {
      this.expenses.getOne(this.id).subscribe((e) =>
        this.form.patchValue({
          ...e,
          category: typeof e.category === 'string' ? e.category : e.category._id,
          date: e.date.slice(0, 10),
        })
      );
    }
  }

  submit() {
    const body = this.form.getRawValue() as any;
    const req = this.id ? this.expenses.update(this.id, body) : this.expenses.create(body);
    req.subscribe(() => this.router.navigate(['/expenses']));
  }
}
