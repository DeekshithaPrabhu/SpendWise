import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'spendwise_token';
const USER_KEY = 'spendwise_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = `${environment.apiUrl}/auth`;

  private _user = signal<User | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user() && !!this.token);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(body: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.api}/login`, body).pipe(tap((r) => this.persist(r)));
  }

  register(body: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.api}/register`, body).pipe(tap((r) => this.persist(r)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private persist(r: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    this._user.set(r.user);
  }
}
