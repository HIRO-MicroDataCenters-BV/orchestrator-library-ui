/**
 * Environment Interface
 * 
 * Defines the structure for environment configuration.
 * Variable names match Helm ConfigMap structure (see charts/orchestrator-library-ui/templates/configmap.yaml)
 */

export interface Environment {
  production: boolean;
  
  // API URLs (matching Helm values.yaml)
  apiUrl: string;
  dashboardUrl: string;
  grafanaUrl: string;
  dexUrl: string;
  cogUrl: string;
  k8sProxyUrl: string;
  
  // Token keys
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  
  // OIDC Configuration
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
