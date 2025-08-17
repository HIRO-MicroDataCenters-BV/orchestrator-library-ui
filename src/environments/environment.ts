import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: '/api',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: '/iframe-dashboard',
  cogUrl: '/iframe-cog',
  grafanaUrl: '/iframe-grafana',
  dexUrl: 'https://dashboard.cog.hiro-develop.nl/apidev',

  // OIDC Configuration
  oidc: {
    authority: 'http://localhost:8080/dex',
    clientId: 'orchestrator-ui-dev',
    clientSecret: 'dev-secret-not-for-production',
    scope: 'openid profile email groups',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 60,
    historyCleanupOff: true,
    autoUserInfo: true,
    triggerRefreshWhenIdTokenExpired: true,
    logLevel: 1, // LogLevel.Warn
    redirectUri: 'http://localhost:4200/authservice/oidc/callback',
    postLogoutRedirectUri: 'http://localhost:4200/auth/login',
    tokenEndpoint: '/dex/token',
    authorizationEndpoint: '/dex/auth',
    userInfoEndpoint: '/dex/userinfo',
    endSessionEndpoint: '/dex/auth/logout',
  },
};
