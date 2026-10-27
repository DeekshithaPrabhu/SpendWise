import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Expense } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/expenses`;

  getAll() { return this.http.get<Expense[]>(this.api); }
  getOne(id: string) { return this.http.get<Expense>(`${this.api}/${id}`); }
  create(body: Partial<Expense>) { return this.http.post<Expense>(this.api, body); }
  update(id: string, body: Partial<Expense>) { return this.http.put<Expense>(`${this.api}/${id}`, body); }
  remove(id: string) { return this.http.delete<void>(`${this.api}/${id}`); }
}
