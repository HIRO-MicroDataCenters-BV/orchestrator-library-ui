import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'https://orchestration-api.aces.hiro-develop.nl',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: 'http://51.44.28.47:30020',
  cogUrl: '/iframe-cog',
  grafanaUrl: 'http://51.44.28.47:30000',
  dexUrl: 'https://dashboard.cog.hiro-develop.nl/apidev',

  // OIDC Configuration
  oidc: {
    authority: 'http://51.44.28.47:30015/dex',
    clientId: 'authservice-oidc',
    clientSecret: '${OIDC_CLIENT_SECRET}',
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
