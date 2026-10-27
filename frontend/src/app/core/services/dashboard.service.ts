import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getSummary() {
    const params = new HttpParams().set('tzOffset', new Date().getTimezoneOffset());
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`, { params });
  }
}
