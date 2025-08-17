import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: '/api',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  dashboardUrl: '/iframe-dashboard',
  cogUrl: '/iframe-cog',
  grafanaUrl: '/iframe-grafana',
  dexUrl: 'https://dashboard.cog.hiro-develop.nl/apidev',

  // OIDC Configuration - Use environment replacements during build
  oidc: {
    authority: '${OIDC_AUTHORITY}',
    clientId: '${OIDC_CLIENT_ID}',
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
    redirectUri: '${OIDC_REDIRECT_URI}',
    postLogoutRedirectUri: '${OIDC_POST_LOGOUT_REDIRECT_URI}',
    tokenEndpoint: '/dex/token',
    authorizationEndpoint: '/dex/auth',
    userInfoEndpoint: '/dex/userinfo',
    endSessionEndpoint: '/dex/endsession',
  },
};
