import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = "auth_token";

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // Decode JWT and set user
      const user = this.decodeToken(token);
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private decodeToken(token: string): User {
    // Implement JWT decode logic here
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
}
