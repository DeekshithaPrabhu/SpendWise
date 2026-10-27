import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/categories`;

  getAll() { return this.http.get<Category[]>(this.api); }
  create(body: Partial<Category>) { return this.http.post<Category>(this.api, body); }
  remove(id: string) { return this.http.delete<void>(`${this.api}/${id}`); }
}
