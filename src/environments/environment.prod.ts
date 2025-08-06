import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://51.44.28.47:30015',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: 'http://51.44.28.47:30016',
  cogUrl: '/cog-iframe',

  // OIDC Configuration
  oidc: {
    authority: '/dex',
    clientId: 'authservice-oidc',
    scope: 'openid profile email groups',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 60,
    historyCleanupOff: true,
    autoUserInfo: true,
    triggerRefreshWhenIdTokenExpired: true,
    logLevel: 3, // LogLevel.Error for production
  },
};
