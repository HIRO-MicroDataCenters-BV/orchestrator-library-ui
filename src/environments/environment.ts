export const environment = {
  production: false,
  apiUrl: '/api',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: '/iframe-dashboard',
  cogUrl: '/iframe-cog',
  grafanaUrl: '/iframe-grafana',

  // OIDC Configuration
  oidc: {
    authority: 'http://51.44.28.47:30015/dex',
    clientId: 'authservice-oidc',
    clientSecret: '8KD8XQ11DTP1685XF8TK3844QAYY7Q',
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
