import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { Category } from '../../../core/models';

const ADD_NEW = '__new__';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a routerLink="/expenses" class="link text-sm">‹ Expenses</a>
    <h1 class="mb-8 mt-2 text-5xl font-semibold">{{ id ? 'Edit expense' : 'New expense' }}</h1>

    <form [formGroup]="form" (ngSubmit)="submit()" class="card max-w-xl space-y-5">
      <div>
        <label class="field-label">Title</label>
        <input formControlName="title" placeholder="e.g. Lunch with team" class="input" />
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="field-label">Amount (₹)</label>
          <input formControlName="amount" type="number" min="0" class="input" />
        </div>
        <div>
          <label class="field-label">Date</label>
          <input formControlName="date" type="date" class="input" />
        </div>
      </div>

      <div>
        <label class="field-label">Category</label>
        <select formControlName="category" class="input">
          <option value="" disabled>Select a category</option>
          @for (c of categories(); track c._id) {
            <option [value]="c._id">{{ c.icon }} {{ c.name }}</option>
          }
          <option [value]="addNew">＋ Add new category…</option>
        </select>

        @if (adding()) {
          <div class="mt-3 flex items-center gap-2 rounded-2xl bg-apple-gray p-3">
            <input [formControl]="newName" placeholder="Category name" class="input !py-2" (keydown.enter)="$event.preventDefault(); createCategory()" />
            <input [formControl]="newColor" type="color" class="h-10 w-12 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent" />
            <button type="button" class="btn-primary shrink-0" [disabled]="newName.invalid" (click)="createCategory()">Add</button>
            <button type="button" class="btn-secondary shrink-0" (click)="adding.set(false)">Cancel</button>
          </div>
          @if (catError()) { <p class="mt-2 text-sm text-apple-red">{{ catError() }}</p> }
        }
      </div>

      <div>
        <label class="field-label">Payment method</label>
        <select formControlName="paymentMethod" class="input">
          <option value="cash">Cash</option><option value="card">Card</option>
          <option value="upi">UPI</option><option value="bank">Bank transfer</option>
        </select>
      </div>

      <div>
        <label class="field-label">Notes</label>
        <textarea formControlName="notes" rows="3" placeholder="Optional" class="input"></textarea>
      </div>

      <button [disabled]="form.invalid || adding()" class="btn-primary !px-8 !py-3">Save expense</button>
    </form>
  `,
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenses = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly addNew = ADD_NEW;
  id = this.route.snapshot.paramMap.get('id');
  categories = signal<Category[]>([]);
  adding = signal(false);
  catError = signal('');

  newName = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  newColor = new FormControl('#0071e3', { nonNullable: true });

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    paymentMethod: ['cash'],
    notes: [''],
  });

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => {
      this.categories.set(c);
      if (this.id) this.loadExpense();
    });

    // Choosing "Add new category…" reveals the inline creator instead of selecting a value.
    this.form.controls.category.valueChanges.subscribe((v) => {
      if (v === ADD_NEW) {
        this.form.controls.category.setValue('', { emitEvent: false });
        this.catError.set('');
        this.adding.set(true);
      }
    });
  }

  private loadExpense() {
    this.expenses.getOne(this.id!).subscribe((e) =>
      this.form.patchValue({
        ...e,
        category: typeof e.category === 'string' ? e.category : e.category._id,
        date: e.date.slice(0, 10),
      })
    );
  }

  createCategory() {
    if (this.newName.invalid) return;
    this.categoryService.create({ name: this.newName.value.trim(), color: this.newColor.value }).subscribe({
      next: (c) => {
        this.categories.update((list) => [...list, c]);
        this.form.controls.category.setValue(c._id, { emitEvent: false });
        this.newName.reset('');
        this.adding.set(false);
      },
      error: (e) => this.catError.set(e.error?.message || 'Could not add category'),
    });
  }

  submit() {
    const body = this.form.getRawValue() as any;
    const req = this.id ? this.expenses.update(this.id, body) : this.expenses.create(body);
    req.subscribe(() => this.router.navigate(['/expenses']));
  }
}
