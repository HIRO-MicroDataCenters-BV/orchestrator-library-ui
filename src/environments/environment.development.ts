import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8086',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: '/iframe-dashboard',
  cogUrl: '/iframe-cog',
  grafanaUrl: '', // Set via GRAFANA_URL environment variable
  dexUrl: 'https://dashboard.cog.hiro-develop.nl/apidev',

  // OIDC Configuration
  oidc: {
    authority: '', // Set via OIDC_AUTHORITY environment variable
    clientId: 'authservice-oidc',
    clientSecret: '', // Set via OIDC_CLIENT_SECRET environment variable
    scope: 'openid profile email groups',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 60,
    historyCleanupOff: true,
    autoUserInfo: true,
    triggerRefreshWhenIdTokenExpired: true,
    logLevel: 0, // LogLevel.Debug for development
    redirectUri: 'http://localhost:4200/authservice/oidc/callback',
    postLogoutRedirectUri: 'http://localhost:4200/auth/login',
    tokenEndpoint: '/dex/token',
    authorizationEndpoint: '/dex/auth',
    userInfoEndpoint: '/dex/userinfo',
    endSessionEndpoint: '/dex/auth/logout',
  },
};
