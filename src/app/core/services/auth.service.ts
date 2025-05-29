import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.token && this.isBrowser) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, { name, email, password })
      .pipe(
        tap((response) => {
          if (response.token && this.isBrowser) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, {
      token,
      password,
    });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.isBrowser ? !!localStorage.getItem(this.TOKEN_KEY) : false;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
