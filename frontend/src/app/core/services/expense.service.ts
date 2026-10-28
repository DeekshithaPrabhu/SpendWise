import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Expense } from '../models';

export type ExpenseSort = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface ExpenseQuery {
  search?: string;
  category?: string;
  month?: string; // YYYY-MM
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD (inclusive)
  sort?: ExpenseSort;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/expenses`;

  getAll(query: ExpenseQuery = {}) {
    let params = new HttpParams().set('tzOffset', new Date().getTimezoneOffset());
    for (const [key, value] of Object.entries(query)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<Expense[]>(this.api, { params });
  }
  getOne(id: string) { return this.http.get<Expense>(`${this.api}/${id}`); }
  create(body: Partial<Expense>) { return this.http.post<Expense>(this.api, body); }
  update(id: string, body: Partial<Expense>) { return this.http.put<Expense>(`${this.api}/${id}`, body); }
  remove(id: string) { return this.http.delete<void>(`${this.api}/${id}`); }
}
