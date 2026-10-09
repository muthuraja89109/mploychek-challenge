import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { API_URL } from './api';
import { LoginResponse, Role, User } from './models';

const TOKEN_KEY = 'mploychek.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Private writable signal, public read-only view
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  // "computed" values update automatically when the signal they read changes
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(userId: string, password: string, role: Role): Observable<User> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { userId, password, role }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this._user.set(res.user);
      }),
      map((res) => res.user)
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Runs once while the app starts (see app.config.ts).
   * If a saved token exists, ask the API who we are, so a page refresh keeps you signed in.
   */
  restoreSession(): Observable<void> {
    if (!this.token) return of(undefined);
    return this.http.get<User>(`${API_URL}/users/me`).pipe(
      tap((user) => this._user.set(user)),
      catchError(() => {
        localStorage.removeItem(TOKEN_KEY); // token expired or invalid
        return of(null);
      }),
      map(() => undefined)
    );
  }
}
