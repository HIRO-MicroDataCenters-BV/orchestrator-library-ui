import { Environment } from './environment.interface';

declare global {
  interface Window {
    __env: Record<string, unknown>;
  }
}

const env = typeof window !== 'undefined' && window.__env ? window.__env : {};

export const environment: Environment = {
  production: true,
  apiUrl: (env['apiUrl'] as string) || 'http://aces-orchestration-api',
  tokenKey: (env['tokenKey'] as string) || 'auth_token',
  refreshTokenKey: (env['refreshTokenKey'] as string) || 'refresh_token',
  userKey: 'user',
  dashboardUrl:
    (env['k8sProxyUrl'] as string) || 'http://aces-dashboard-reverse-proxy',
  cogUrl:
    (env['cogUrl'] as string) ||
    'https://dashboard.cog.hiro-develop.nl/uidev/?is_iframe=1',
  grafanaUrl:
    (env['grafanaUrl'] as string) ||
    'http://grafana-nginx-reverse-proxy.ul.svc.cluster.local:8080',
  dexUrl:
    (env['dexUrl'] as string) || 'https://dashboard.cog.hiro-develop.nl/apidev',

  // OIDC Configuration
  oidc: {
    authority:
      (env['oidcAuthority'] as string) || 'http://aces-orchestration-api/dex',
    clientId: (env['oidcClientId'] as string) || 'authservice-oidc',
    clientSecret:
      (env['oidcClientSecret'] as string) || '${OIDC_CLIENT_SECRET}',
    scope: (env['oidcScope'] as string) || 'openid profile email groups',
    responseType: (env['oidcResponseType'] as string) || 'code',
    silentRenew: (env['oidcSilentRenew'] as boolean) ?? true,
    useRefreshToken: (env['oidcUseRefreshToken'] as boolean) ?? true,
    renewTimeBeforeTokenExpiresInSeconds:
      (env['oidcRenewTimeBeforeTokenExpiresInSeconds'] as number) ?? 60,
    historyCleanupOff: (env['oidcHistoryCleanupOff'] as boolean) ?? true,
    autoUserInfo: (env['oidcAutoUserInfo'] as boolean) ?? true,
    triggerRefreshWhenIdTokenExpired:
      (env['oidcTriggerRefreshWhenIdTokenExpired'] as boolean) ?? true,
    logLevel: (env['oidcLogLevel'] as number) ?? 3, // LogLevel.Error for production
    redirectUri:
      (env['oidcRedirectUri'] as string) ||
      'http://aces-orchestration-api/authservice/oidc/callback',
    postLogoutRedirectUri:
      (env['oidcPostLogoutRedirectUri'] as string) ||
      'http://aces-orchestration-api/auth/login',
    tokenEndpoint: (env['oidcTokenEndpoint'] as string) || '/dex/token',
    authorizationEndpoint:
      (env['oidcAuthorizationEndpoint'] as string) || '/dex/auth',
    userInfoEndpoint:
      (env['oidcUserInfoEndpoint'] as string) || '/dex/userinfo',
    endSessionEndpoint:
      (env['oidcEndSessionEndpoint'] as string) || '/dex/auth/logout',
  },
};
