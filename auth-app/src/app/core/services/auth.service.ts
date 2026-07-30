import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';

import { apiConfig } from '../config/api.config';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    username: string;
    email: string;
  };
}

export interface AuthUser {
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${apiConfig.baseUrl}/auth`;
  private readonly tokenStorageKey = 'access_token';
  private readonly userStorageKey = 'auth_user';
  private readonly sessionHintStorageKey = 'has_session_hint';
  private refreshInFlight$: Observable<AuthResponse | null> | null = null;

  register(payload: RegisterPayload) {
    return this.http.post<{ username: string; email: string }>(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload, { withCredentials: true }).pipe(
      tap((response) => this.persistSession(response)),
    );
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken(); // Obtém o token de acesso do armazenamento local
    return !!token && !this.isTokenExpired(token); // Checa se o token existe e se não está expirado
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getUser(): AuthUser | null {
    const rawUser = localStorage.getItem(this.userStorageKey);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  }

  ensureSession(): Observable<boolean> {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      return of(true);
    }

    if (!token && !localStorage.getItem(this.sessionHintStorageKey)) {
      return of(false);
    }

    return this.refreshToken().pipe(map((response) => !!response?.access_token));
  }

  /** O Método refreshToken é responsável por enviar uma solicitação para o endpoint de refresh do backend, obtendo um novo token de acesso.
   * Ele também gerencia o estado da solicitação de refresh para evitar múltiplas chamadas simultâneas e persiste a sessão do usuário no armazenamento local. 
   */
  refreshToken(): Observable<AuthResponse | null> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<AuthResponse>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
        .pipe(
          tap((response) => this.persistSession(response)),
          catchError(() => {
            this.clearSession();
            return of(null);
          }),
          finalize(() => {
            this.refreshInFlight$ = null;
          }),
          shareReplay(1),
        );
    }

    return this.refreshInFlight$;
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      }),
    );
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenStorageKey, response.access_token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(response.user));
    localStorage.setItem(this.sessionHintStorageKey, '1');
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem(this.sessionHintStorageKey);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      if (!payload.exp) {
        return true;
      }

      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
