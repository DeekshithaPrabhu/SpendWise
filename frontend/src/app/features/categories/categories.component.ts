import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="mb-8 text-5xl font-semibold">Categories</h1>

    <form [formGroup]="form" (ngSubmit)="add()" class="card mb-6 flex max-w-xl items-center gap-3 !p-4">
      <input formControlName="name" placeholder="New category name" class="input" />
      <input formControlName="color" type="color" class="h-10 w-12 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent" />
      <button [disabled]="form.invalid" class="btn-primary shrink-0">Add</button>
    </form>
    @if (error()) { <p class="mb-4 text-sm text-apple-red">{{ error() }}</p> }

    <div class="card max-w-xl !p-2">
      @for (c of categories(); track c._id) {
        <div class="flex items-center gap-4 rounded-2xl px-4 py-3 transition hover:bg-apple-gray">
          <span class="grid h-10 w-10 place-items-center rounded-full text-lg" [style.background]="c.color + '22'">
            {{ c.icon || '•' }}
          </span>
          <span class="flex-1 font-medium">{{ c.name }}</span>
          @if (c.isDefault) {
            <span class="text-xs text-apple-muted">Default</span>
          } @else {
            <button (click)="remove(c._id)" class="text-sm text-apple-red hover:underline">Delete</button>
          }
        </div>
      }
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CategoryService);
  categories = signal<Category[]>([]);
  error = signal('');

  form = this.fb.nonNullable.group({ name: ['', Validators.required], color: ['#0071e3'] });

  ngOnInit() { this.load(); }
  load() { this.service.getAll().subscribe((c) => this.categories.set(c)); }

  add() {
    this.error.set('');
    this.service.create(this.form.getRawValue()).subscribe({
      next: () => { this.form.reset({ name: '', color: '#0071e3' }); this.load(); },
      error: (e) => this.error.set(e.error?.message || 'Could not add category'),
    });
  }
  remove(id: string) { this.service.remove(id).subscribe(() => this.load()); }
}
