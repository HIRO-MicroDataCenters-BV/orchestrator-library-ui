/**
 * Environment Interface
 * Defines the structure for all environment configuration files
 */

export interface Environment {
  production: boolean;
  apiUrl: string;
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  dashboardUrl: string;
  cogUrl: string;
  grafanaUrl: string;
  dexUrl: string;
  k8sProxyUrl: string;
  oidcAuthority: string;
  oidcClientId: string;
  oidcClientSecret: string;
  oidcScope: string;
  oidcResponseType: string;
  oidcSilentRenew: boolean;
  oidcUseRefreshToken: boolean;
  oidcRenewTimeBeforeTokenExpiresInSeconds: number;
  oidcHistoryCleanupOff: boolean;
  oidcAutoUserInfo: boolean;
  oidcTriggerRefreshWhenIdTokenExpired: boolean;
  oidcLogLevel: number;
  oidcRedirectUri: string;
  oidcPostLogoutRedirectUri: string;
  oidcTokenEndpoint: string;
  oidcAuthorizationEndpoint: string;
  oidcUserInfoEndpoint: string;
  oidcEndSessionEndpoint: string;
}
