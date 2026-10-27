import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="text-2xl font-bold mb-4">Categories</h1>
    <form [formGroup]="form" (ngSubmit)="add()" class="flex gap-2 mb-4">
      <input formControlName="name" placeholder="Name" class="border rounded p-2" />
      <input formControlName="color" type="color" class="h-10 w-12" />
      <button [disabled]="form.invalid" class="bg-brand-600 text-white px-3 rounded disabled:opacity-50">Add</button>
    </form>
    <ul class="bg-white rounded-xl shadow divide-y">
      @for (c of categories(); track c._id) {
        <li class="flex items-center gap-3 p-3">
          <span class="w-3 h-3 rounded-full" [style.background]="c.color"></span>
          <span class="flex-1">{{ c.name }}</span>
          <button (click)="remove(c._id)" class="text-sm text-red-600">Delete</button>
        </li>
      }
    </ul>
  `,
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CategoryService);
  categories = signal<Category[]>([]);

  form = this.fb.nonNullable.group({ name: ['', Validators.required], color: ['#6366f1'] });

  ngOnInit() { this.load(); }
  load() { this.service.getAll().subscribe((c) => this.categories.set(c)); }
  add() { this.service.create(this.form.getRawValue()).subscribe(() => { this.form.reset({ name: '', color: '#6366f1' }); this.load(); }); }
  remove(id: string) { this.service.remove(id).subscribe(() => this.load()); }
}
