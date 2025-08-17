import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface DexAuthState {
  state?: string;
  req?: string;
  code?: string;
  sessionCookie?: string;
}

export interface DexApiRequest {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

export interface DexAuthResult {
  authserviceSession: string;
}

@Injectable({
  providedIn: 'root',
})
export class DexAuthService {
  private readonly http = inject(HttpClient);
  private authState: DexAuthState = {};

  /**
   * Step 1: Get STATE from initial request
   */
  private getState(): Observable<string> {
    return this.http.get('/dex', {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response) => {
        if (response.status === 302) {
          const location = response.headers.get('location');
          if (location) {
            const stateMatch = location.match(/state=([^&]+)/);
            if (stateMatch?.[1]) return stateMatch[1];
          }
        }
        const stateMatch = response.body?.match(/STATE=([A-Za-z0-9_-]+)/);
        if (stateMatch?.[1]) return stateMatch[1];
        throw new Error('State not found');
      }),
      catchError(() => throwError(() => new Error('State extraction failed')))
    );
  }

  /**
   * Step 2: Get REQ token from auth endpoint
   */
  private getAuthRequest(state: string): Observable<string> {
    const params = new URLSearchParams({
      client_id: 'kubeflow-oidc-authservice',
      redirect_uri: '/login/oidc',
      response_type: 'code',
      scope: 'profile email groups openid',
      state: state,
    });

    return this.http.get(`/dex/auth?${params.toString()}`, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response) => {
        const authStateMatch = response.body?.match(/action="[^"]*[?&](?:amp;)?state=([^"&]+)"/);
        if (authStateMatch?.[1]) return authStateMatch[1];

        const reqMatch = response.body?.match(/REQ=([A-Za-z0-9_-]+)/);
        if (reqMatch?.[1]) return reqMatch[1];

        throw new Error('Auth state not found');
      }),
      catchError(() => throwError(() => new Error('Auth request failed')))
    );
  }

  /**
   * Step 3: Submit credentials
   */
  private submitCredentials(req: string, login: string, password: string): Observable<string> {
    const body = `login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;

    return this.http.post(`/dex/auth/local/login?back=&state=${req}`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map(() => req),
      catchError(() => throwError(() => new Error('Authentication failed')))
    );
  }

  /**
   * Step 4: Get approval and extract CODE
   */
  private getApproval(req: string): Observable<string> {
    return this.http.get(`/dex/approval?req=${req}`, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response) => {
        if (response.status === 302 || response.status === 303) {
          const location = response.headers.get('location');
          if (location) {
            const codeMatch = location.match(/code=([^&]+)/);
            if (codeMatch?.[1]) return codeMatch[1];
          }
        }

        const codeMatch = response.body?.match(/code=([^&"]+)/);
        if (codeMatch?.[1]) return codeMatch[1];

        throw new Error('CODE not found');
      }),
      catchError(() => throwError(() => new Error('Approval failed')))
    );
  }

  /**
   * Step 5: Exchange code for session cookie
   */
  private getSessionCookie(code: string, state: string): Observable<string> {
    return this.http.get(`/authservice/oidc/callback?code=${code}&state=${state}`, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response) => {
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          const sessionMatch = setCookieHeader.match(/authservice_session=([^;\s]+)/);
          if (sessionMatch?.[1]) return sessionMatch[1];
        }
        throw new Error('Session cookie not found');
      }),
      catchError(() => throwError(() => new Error('Session failed')))
    );
  }

  /**
   * Complete DEX authorization flow
   */
  authorizeWithDex(login: string, password: string): Observable<DexAuthResult> {
    this.authState = {};

    return this.getState().pipe(
      switchMap((state) => {
        this.authState.state = state;
        return this.getAuthRequest(state);
      }),
      switchMap((req) => {
        this.authState.req = req;
        return this.submitCredentials(req, login, password);
      }),
      switchMap((req) => this.getApproval(req)),
      switchMap((code) => {
        this.authState.code = code;
        return this.getSessionCookie(code, this.authState.state!);
      }),
      map((sessionCookie) => {
        this.authState.sessionCookie = sessionCookie;
        return { authserviceSession: sessionCookie };
      })
    );
  }

  /**
   * Make authenticated request using session cookie
   */
  makeAuthenticatedRequest<T>(request: DexApiRequest): Observable<T> {
    if (!this.authState.sessionCookie) {
      return throwError(() => new Error('Not authenticated'));
    }

    const url = request.endpoint.startsWith('/') ? request.endpoint : `/${request.endpoint}`;
    const headers = {
      ...request.headers,
      'Cookie': `authservice_session=${this.authState.sessionCookie}`
    };

    return this.http.request<T>(request.method || 'GET', url, {
      headers,
      body: request.body
    });
  }

  /**
   * Get current session cookie
   */
  getSession(): string | undefined {
    return this.authState.sessionCookie;
  }

  /**
   * Clear session
   */
  clearSession(): void {
    this.authState = {};
  }
}
