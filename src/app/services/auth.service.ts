import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, LogoutResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7178/api/Auth';

  // In-memory runtime session state (never stored in localStorage/sessionStorage)
  readonly authenticatedUser = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.authenticatedUser());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        username: credentials.username,
        password: credentials.password
      },
      {
        withCredentials: true
      }
    ).pipe(
      tap((res) => {
        if (res && res.username) {
          this.authenticatedUser.set(res.username);
        } else {
          this.authenticatedUser.set(credentials.username);
        }
      })
    );
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.clearAuthState();
      })
    );
  }

  clearAuthState(): void {
    this.authenticatedUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
