/**
 * OpenID Connect Configuration
 * Configuration for angular-auth-oidc-client with DEX provider
 */

import { LogLevel } from 'angular-auth-oidc-client';
import { environment } from '../../../../environments/environment';
import { AUTH_CONSTANTS } from '../../../shared/constants/app.constants';
import { OidcConfig } from '../../../shared/models/auth.models';

/**
 * Get OIDC configuration for the current environment
 */
export function getOidcConfig(): OidcConfig {
  // Extract base URL from authority for building full endpoint URLs
  const baseUrl = environment.oidc.authority.replace(/\/dex$/, '');

  return {
    authority: environment.oidc.authority,
    redirectUrl: environment.oidc.redirectUri,
    postLogoutRedirectUri: environment.oidc.postLogoutRedirectUri,
    clientId: environment.oidc.clientId,
    scope: environment.oidc.scope,
    responseType: environment.oidc.responseType,
    silentRenew: environment.oidc.silentRenew,
    useRefreshToken: environment.oidc.useRefreshToken,
    renewTimeBeforeTokenExpiresInSeconds:
      environment.oidc.renewTimeBeforeTokenExpiresInSeconds,
    logLevel: environment.oidc.logLevel as LogLevel,
    historyCleanupOff: environment.oidc.historyCleanupOff,
    autoUserInfo: environment.oidc.autoUserInfo,
    triggerRefreshWhenIdTokenExpired:
      environment.oidc.triggerRefreshWhenIdTokenExpired,

    // Completely disable discovery and use manual endpoints only
    wellKnownEndpoints: {
      issuer: environment.oidc.authority,
      authorizationEndpoint: `${baseUrl}${environment.oidc.authorizationEndpoint}`,
      tokenEndpoint: `${baseUrl}${environment.oidc.tokenEndpoint}`,
      userinfoEndpoint: `${baseUrl}${environment.oidc.userInfoEndpoint}`,
      endSessionEndpoint: `${baseUrl}${environment.oidc.endSessionEndpoint}`,
      jwksUri: `${baseUrl}/dex/keys`,
    },

    // Routes for navigation after auth events
    postLoginRoute: AUTH_CONSTANTS.ROUTES.AFTER_LOGIN,
    forbiddenRoute: AUTH_CONSTANTS.ROUTES.FORBIDDEN,
    unauthorizedRoute: AUTH_CONSTANTS.ROUTES.UNAUTHORIZED,

    // Secure routes that require authentication
    secureRoutes: [environment.apiUrl, environment.cogUrl],

    // Custom parameters for auth requests
    customParamsAuthRequest: {
      prompt: 'login',
    },

    // Custom parameters for refresh token requests
    customParamsRefreshTokenRequest: {},

    // Custom parameters for end session requests
    customParamsEndSessionRequest: {},

    // Silent renew configuration
    silentRenewUrl: `${
      environment.oidc.redirectUri.split('/authservice')[0]
    }/silent-renew.html`,

    // Token validation
    ignoreNonceAfterRefresh: true,
    triggerAuthorizationResultEvent: true,

    // PKCE configuration (recommended for SPA)
    usePushedAuthorisationRequests: false,

    // Additional security settings
    skipSubjectCheck: false,

    // Storage configuration
    storage:
      typeof window !== 'undefined' && typeof localStorage !== 'undefined'
        ? localStorage
        : null,
  };
}

/**
 * Get OIDC configuration for mock/development mode
 */
export function getMockOidcConfig(): OidcConfig {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:4200';

  return {
    authority: 'https://mock-authority.local',
    redirectUrl: `${baseUrl}${AUTH_CONSTANTS.ROUTES.CALLBACK}`,
    postLogoutRedirectUri: `${baseUrl}${AUTH_CONSTANTS.ROUTES.AFTER_LOGOUT}`,
    clientId: 'mock-client-id',
    scope: 'openid profile email',
    responseType: 'code',
    silentRenew: false,
    useRefreshToken: false,
    logLevel: LogLevel.Debug,
    historyCleanupOff: true,
    autoUserInfo: false,

    // Disable OIDC validation for mock mode
    disableIdTokenValidation: true,
    skipSubjectCheck: true,

    // Mock routes
    postLoginRoute: AUTH_CONSTANTS.ROUTES.AFTER_LOGIN,
    forbiddenRoute: AUTH_CONSTANTS.ROUTES.FORBIDDEN,
    unauthorizedRoute: AUTH_CONSTANTS.ROUTES.UNAUTHORIZED,
  };
}

/**
 // DEX-specific configuration overrides
 */
export const DEX_CONFIG_OVERRIDES = {
  // Use environment-based configuration
  scope: environment.oidc.scope,
  silentRenew: environment.oidc.silentRenew,
  useRefreshToken: environment.oidc.useRefreshToken,
  autoUserInfo: environment.oidc.autoUserInfo,

  // Simplified custom parameters for DEX
  customParamsAuthRequest: {},
};

/**
 * Get final OIDC configuration with environment-specific overrides
 */
export function getFinalOidcConfig(): OidcConfig {
  const baseConfig = getOidcConfig();

  // Always apply DEX overrides since we're using DEX
  return {
    ...baseConfig,
    ...DEX_CONFIG_OVERRIDES,
  };
}

/**
 * Check if DEX is available
 */
export async function isDexAvailable(): Promise<boolean> {
  try {
    const response = await fetch(
      `${AUTH_CONSTANTS.OIDC.AUTHORITY}/.well-known/openid_configuration`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      }
    );
    return response.ok;
  } catch (error) {
    console.warn('DEX availability check failed:', error);
    return false;
  }
}

/**
 * Get configuration based on DEX availability
 */
export async function getAdaptiveOidcConfig(): Promise<OidcConfig> {
  // Always return the real config - the auth service will handle mock mode
  return getFinalOidcConfig();
}
