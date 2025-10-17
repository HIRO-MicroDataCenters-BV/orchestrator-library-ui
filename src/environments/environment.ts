import { Environment } from './environment.interface';

/**
 * Environment Configuration
 *
 * This file provides a unified environment configuration that works in all modes.
 * ALL values come from window.__env (loaded from env.js).
 *
 * Variable names match Helm ConfigMap structure (see charts/orchestrator-library-ui/templates/configmap.yaml)
 *
 * NO HARDCODED VALUES HERE - everything is configured via env.js
 */

declare global {
  interface Window {
    __env: Record<string, unknown>;
  }
}

// Ensure env is loaded
if (typeof window !== 'undefined' && !window.__env) {
  throw new Error(
    'Environment not loaded! Make sure env.js is loaded before the application.'
  );
}

// Helper to get env value with type safety
const getEnv = <T>(key: string): T => {
  if (typeof window === 'undefined') {
    return undefined as T;
  }
  return window.__env[key] as T;
};

export const environment: Environment = {
  production: getEnv<boolean>('production'),

  // API URLs (matching Helm values.yaml)
  apiUrl: getEnv<string>('apiUrl'),
  dashboardUrl: getEnv<string>('dashboardUrl'),
  grafanaUrl: getEnv<string>('grafanaUrl'),
  dexUrl: getEnv<string>('dexUrl'),
  cogUrl: getEnv<string>('cogUrl'),
  k8sProxyUrl: getEnv<string>('k8sProxyUrl'),

  // Token Configuration
  tokenKey: getEnv<string>('tokenKey'),
  refreshTokenKey: getEnv<string>('refreshTokenKey'),
  userKey: getEnv<string>('userKey'),

  // OIDC Configuration
  oidc: {
    authority: getEnv<string>('oidcAuthority'),
    clientId: getEnv<string>('oidcClientId'),
    clientSecret: getEnv<string>('oidcClientSecret'),
    scope: getEnv<string>('oidcScope'),
    responseType: getEnv<string>('oidcResponseType'),
    silentRenew: getEnv<boolean>('oidcSilentRenew'),
    useRefreshToken: getEnv<boolean>('oidcUseRefreshToken'),
    renewTimeBeforeTokenExpiresInSeconds: getEnv<number>(
      'oidcRenewTimeBeforeTokenExpiresInSeconds'
    ),
    historyCleanupOff: getEnv<boolean>('oidcHistoryCleanupOff'),
    autoUserInfo: getEnv<boolean>('oidcAutoUserInfo'),
    triggerRefreshWhenIdTokenExpired: getEnv<boolean>(
      'oidcTriggerRefreshWhenIdTokenExpired'
    ),
    logLevel: getEnv<number>('oidcLogLevel'),
    redirectUri: getEnv<string>('oidcRedirectUri'),
    postLogoutRedirectUri: getEnv<string>('oidcPostLogoutRedirectUri'),
    tokenEndpoint: getEnv<string>('oidcTokenEndpoint'),
    authorizationEndpoint: getEnv<string>('oidcAuthorizationEndpoint'),
    userInfoEndpoint: getEnv<string>('oidcUserInfoEndpoint'),
    endSessionEndpoint: getEnv<string>('oidcEndSessionEndpoint'),
  },
};

// Log environment configuration in non-production for debugging
if (!environment.production && typeof console !== 'undefined') {
  console.log('🔧 Environment Configuration loaded from window.__env:', {
    production: environment.production,
    apiUrl: environment.apiUrl,
    dashboardUrl: environment.dashboardUrl,
    k8sProxyUrl: environment.k8sProxyUrl,
    oidcAuthority: environment.oidc.authority,
  });
}
