import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  dashboardUrl: string;
  cogUrl: string;
  grafanaUrl: string;
  dexUrl: string;
  oidc: {
    authority: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    responseType: string;
    silentRenew: boolean;
    useRefreshToken: boolean;
    renewTimeBeforeTokenExpiresInSeconds: number;
    historyCleanupOff: boolean;
    autoUserInfo: boolean;
    triggerRefreshWhenIdTokenExpired: boolean;
    logLevel: number;
    redirectUri: string;
    postLogoutRedirectUri: string;
    tokenEndpoint: string;
    authorizationEndpoint: string;
    userInfoEndpoint: string;
    endSessionEndpoint: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly _config: AppConfig;

  constructor() {
    this._config = this.buildConfig();
  }

  private buildConfig(): AppConfig {
    return {
      production: environment.production,
      apiUrl: this.getEnvVar('API_URL', environment.apiUrl),
      tokenKey: environment.tokenKey,
      refreshTokenKey: environment.refreshTokenKey,
      userKey: environment.userKey,
      dashboardUrl: this.getEnvVar('DASHBOARD_URL', environment.dashboardUrl),
      cogUrl: this.getEnvVar('COG_URL', environment.cogUrl),
      grafanaUrl: this.getEnvVar('GRAFANA_URL', environment.grafanaUrl),
      dexUrl: this.getEnvVar('DEX_URL', environment.dexUrl),
      oidc: {
        authority: this.getEnvVar('OIDC_AUTHORITY', environment.oidc.authority),
        clientId: this.getEnvVar('OIDC_CLIENT_ID', environment.oidc.clientId),
        clientSecret: this.getEnvVar(
          'OIDC_CLIENT_SECRET',
          environment.oidc.clientSecret
        ),
        scope: this.getEnvVar('OIDC_SCOPE', environment.oidc.scope),
        responseType: environment.oidc.responseType,
        silentRenew: environment.oidc.silentRenew,
        useRefreshToken: environment.oidc.useRefreshToken,
        renewTimeBeforeTokenExpiresInSeconds:
          environment.oidc.renewTimeBeforeTokenExpiresInSeconds,
        historyCleanupOff: environment.oidc.historyCleanupOff,
        autoUserInfo: environment.oidc.autoUserInfo,
        triggerRefreshWhenIdTokenExpired:
          environment.oidc.triggerRefreshWhenIdTokenExpired,
        logLevel: environment.oidc.logLevel,
        redirectUri: this.getEnvVar(
          'OIDC_REDIRECT_URI',
          environment.oidc.redirectUri
        ),
        postLogoutRedirectUri: this.getEnvVar(
          'OIDC_POST_LOGOUT_REDIRECT_URI',
          environment.oidc.postLogoutRedirectUri
        ),
        tokenEndpoint: environment.oidc.tokenEndpoint,
        authorizationEndpoint: environment.oidc.authorizationEndpoint,
        userInfoEndpoint: environment.oidc.userInfoEndpoint,
        endSessionEndpoint: environment.oidc.endSessionEndpoint,
      },
    };
  }

  private getEnvVar(key: string, fallback: string): string {
    // For client-side, we can't access process.env directly
    // Environment variables should be injected during build time
    // or through a configuration API endpoint
    if (typeof window !== 'undefined') {
      // Client-side: use window.__env__ if available (injected via index.html)
      const windowAny = window as unknown as {
        __env__?: Record<string, string>;
      };
      if (windowAny.__env__ && windowAny.__env__[key]) {
        return windowAny.__env__[key];
      }
    } else {
      // Server-side: can access process.env
      const envValue = process.env[key];
      if (envValue) {
        return envValue;
      }
    }

    return fallback;
  }

  public get config(): AppConfig {
    return { ...this._config };
  }

  public get apiUrl(): string {
    return this._config.apiUrl;
  }

  public get dashboardUrl(): string {
    return this._config.dashboardUrl;
  }

  public get cogUrl(): string {
    return this._config.cogUrl;
  }

  public get grafanaUrl(): string {
    return this._config.grafanaUrl;
  }

  public get dexUrl(): string {
    return this._config.dexUrl;
  }

  public get oidcConfig(): AppConfig['oidc'] {
    return { ...this._config.oidc };
  }

  public get isProduction(): boolean {
    return this._config.production;
  }

  public get isDevelopment(): boolean {
    return !this._config.production;
  }

  /**
   * Validates that required configuration values are present
   * @returns Array of missing configuration keys
   */
  public validateConfig(): string[] {
    const missing: string[] = [];

    if (!this._config.apiUrl) missing.push('apiUrl');
    if (!this._config.oidc.authority) missing.push('oidc.authority');
    if (!this._config.oidc.clientId) missing.push('oidc.clientId');
    if (!this._config.oidc.clientSecret && this._config.production) {
      missing.push('oidc.clientSecret');
    }

    return missing;
  }

  /**
   * Logs configuration status (without sensitive data)
   */
  public logConfigStatus(): void {
    const missing = this.validateConfig();

    if (missing.length > 0) {
      console.error('Missing required configuration:', missing);
    } else {
      console.log('Configuration loaded successfully');
    }

    // Log non-sensitive config for debugging
    console.log('Config Status:', {
      production: this._config.production,
      apiUrl: this._config.apiUrl,
      hasClientSecret: !!this._config.oidc.clientSecret,
      authority: this._config.oidc.authority,
      clientId: this._config.oidc.clientId,
    });
  }
}
