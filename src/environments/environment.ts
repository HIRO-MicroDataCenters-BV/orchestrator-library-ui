export const environment = {
  production: false,
  apiUrl: '/api',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: 'http://51.44.28.47:30016',
  cogUrl: '/cog',

  // OIDC Configuration
  oidc: {
    authority: 'http://localhost:4200/dex',
    clientId: 'authservice-oidc',
    scope: 'openid profile email groups',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 60,
    historyCleanupOff: true,
    autoUserInfo: true,
    triggerRefreshWhenIdTokenExpired: true,
    logLevel: 1, // LogLevel.Warn
  },
};
