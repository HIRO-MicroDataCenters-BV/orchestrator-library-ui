import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: '', // Set via API_URL environment variable
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
    logLevel: 3, // LogLevel.Error for production
    redirectUri: '', // Set via OIDC_REDIRECT_URI environment variable
    postLogoutRedirectUri: '', // Set via OIDC_POST_LOGOUT_REDIRECT_URI environment variable
    tokenEndpoint: '/dex/token',
    authorizationEndpoint: '/dex/auth',
    userInfoEndpoint: '/dex/userinfo',
    endSessionEndpoint: '/dex/auth/logout',
  },
};
