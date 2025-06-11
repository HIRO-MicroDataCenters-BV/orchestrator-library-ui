import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User } from '../models/user.model';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = environment.apiUrl;
  
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.refreshTokenKey;
  private readonly USER_KEY = environment.userKey;

  private readonly mockUsers = [
    {
      id: '1',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
      password: 'password'
    },
    {
      id: '2',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password: 'admin'
    }
  ];
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    // Check localStorage availability (for SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson) as User;
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (_error) {
          this.clearStorage();
        }
      }
    }
  }

  login(credentials: AuthRequest): Observable<User> {
    // In demo mode we use mock data
    return this.mockLogin(credentials).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(response => response.user)
    );
  }

  // Method for demonstration, simulates API request
  private mockLogin(credentials: AuthRequest): Observable<AuthResponse> {
    // Find user in mocks by email
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    // Check credentials
    if (user && credentials.password === user.password) {
      // Create a copy of user without password for security
      const { password: _, ...userWithoutPassword } = user;
      
      const mockResponse: AuthResponse = {
        accessToken: `mock-jwt-token-${user.id}`,
        refreshToken: `mock-refresh-token-${user.id}`,
        user: userWithoutPassword as User,
        expiresIn: 3600 // 1 hour
      };
      return of(mockResponse);
    }
    
    return throwError(() => new Error('Invalid email or password'));
  }

  register(userData: AuthRequest): Observable<User> {
    // In demo mode we use mock data
    return this.mockRegister(userData).pipe(
      tap(response => {
        this.setSession(response);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(response => response.user),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  
  // Method for demonstration, simulates API request for registration
  private mockRegister(userData: AuthRequest): Observable<AuthResponse> {
    // Check that user with this email doesn't exist
    const existingUser = this.mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return throwError(() => new Error('User with this email already exists'));
    }
    
    // Create new user
    const newUser = {
      id: (this.mockUsers.length + 1).toString(),
      email: userData.email,
      firstName: 'New', // Default value instead of accessing userData.firstName
      lastName: 'User', // Default value instead of accessing userData.lastName
      role: 'user', // Default regular user
      password: userData.password // Save password for authorization
    };
    
    // Add user to mocks (in real application this would be an API request)
    this.mockUsers.push(newUser);
    
    // Create a copy of user without password for security
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Create response
    const mockResponse: AuthResponse = {
      accessToken: `mock-jwt-token-${newUser.id}`,
      refreshToken: `mock-refresh-token-${newUser.id}`,
      user: userWithoutPassword as User,
      expiresIn: 3600 // 1 hour
    };
    
    return of(mockResponse);
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    // Check localStorage availability (for SSR)
    if (typeof window === 'undefined' || !window.localStorage) {
      return throwError(() => new Error('localStorage is not available'));
    }
    
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    // In demo mode we use mock data
    return this.mockRefreshToken(refreshToken);
  }
  
  // Method for demonstration, simulates API request for token refresh
  private mockRefreshToken(_refreshToken: string): Observable<AuthResponse> {
    // Get current user
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('User is not authorized'));
    }
    
    // Create new token
    const mockResponse: AuthResponse = {
      accessToken: `mock-jwt-token-refreshed-${currentUser.id}`,
      refreshToken: `mock-refresh-token-refreshed-${currentUser.id}`,
      user: currentUser,
      expiresIn: 3600 // 1 hour
    };
    
    return of(mockResponse);
  }

  private setSession(authResult: AuthResponse): void {
    // Check localStorage availability (for SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
      if (authResult.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refreshToken);
      }
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    }
  }

  private clearStorage(): void {
    // Check localStorage availability (for SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}