import { Environment } from './environment.interface';

declare global {
  interface Window {
    __env?: Partial<Environment>;
  }
}

const getEnv = (): Partial<Environment> => {
  if (typeof window !== 'undefined' && window.__env) {
    return window.__env;
  }
  return {};
};

const env = getEnv();

export const environment = {
  production: true,
  apiUrl: env.apiUrl ?? '',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: env.dashboardUrl ?? '',
  cogUrl: env.cogUrl ?? '',
  grafanaUrl: env.grafanaUrl ?? '',
  dexUrl: env.dexUrl ?? '',
  oidc: {
    authority: env.oidcAuthority ?? '',
    clientId: env.oidcClientId ?? '',
    clientSecret: env.oidcClientSecret ?? '',
    scope: env.oidcScope ?? '',
    responseType: env.oidcResponseType ?? '',
    silentRenew: env.oidcSilentRenew ?? true,
    useRefreshToken: env.oidcUseRefreshToken ?? true,
    renewTimeBeforeTokenExpiresInSeconds:
      env.oidcRenewTimeBeforeTokenExpiresInSeconds ?? 0,
    historyCleanupOff: env.oidcHistoryCleanupOff ?? true,
    autoUserInfo: env.oidcAutoUserInfo ?? true,
    triggerRefreshWhenIdTokenExpired:
      env.oidcTriggerRefreshWhenIdTokenExpired ?? true,
    logLevel: env.oidcLogLevel ?? 0,
    redirectUri: env.oidcRedirectUri ?? '',
    postLogoutRedirectUri: env.oidcPostLogoutRedirectUri ?? '',
    tokenEndpoint: env.oidcTokenEndpoint ?? '',
    authorizationEndpoint: env.oidcAuthorizationEndpoint ?? '',
    userInfoEndpoint: env.oidcUserInfoEndpoint ?? '',
    endSessionEndpoint: env.oidcEndSessionEndpoint ?? '',
  },
};
