import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://51.44.28.47:30015',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: 'http://51.44.28.47:30020',
  cogUrl: 'https://cui-nine.vercel.app/?is_iframe=1',
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
    logLevel: 3, // LogLevel.Error for production
    redirectUri: 'http://51.44.28.47:30015/authservice/oidc/callback',
    postLogoutRedirectUri: 'http://51.44.28.47:30015/auth/login',
    tokenEndpoint: '/dex/token',
    authorizationEndpoint: '/dex/auth',
    userInfoEndpoint: '/dex/userinfo',
    endSessionEndpoint: '/dex/auth/logout',
  },
};
