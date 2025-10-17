#!/bin/bash
# Generate env.js from environment variables
# Usage: ./scripts/generate-env.sh > dist/browser/assets/env.js

cat <<EOF
(function (window) {
  window.__env = {
    production: ${PRODUCTION},
    apiUrl: "${API_TARGET}",
    dashboardUrl: "${DASHBOARD_TARGET}",
    grafanaUrl: "${GRAFANA_TARGET}",
    dexUrl: "${DEX_TARGET}",
    cogUrl: "${COG_TARGET}",
    k8sProxyUrl: "${K8S_PROXY_TARGET}",
    tokenKey: "${TOKEN_KEY}",
    refreshTokenKey: "${REFRESH_TOKEN_KEY}",
    userKey: "${USER_KEY}",
    oidcAuthority: "${OIDC_AUTHORITY}",
    oidcClientId: "${OIDC_CLIENT_ID}",
    oidcClientSecret: "${OIDC_CLIENT_SECRET}",
    oidcScope: "${OIDC_SCOPE}",
    oidcResponseType: "${OIDC_RESPONSE_TYPE}",
    oidcSilentRenew: ${OIDC_SILENT_RENEW},
    oidcUseRefreshToken: ${OIDC_USE_REFRESH_TOKEN},
    oidcRenewTimeBeforeTokenExpiresInSeconds: ${OIDC_RENEW_TIME_BEFORE_TOKEN_EXPIRES_IN_SECONDS},
    oidcHistoryCleanupOff: ${OIDC_HISTORY_CLEANUP_OFF},
    oidcAutoUserInfo: ${OIDC_AUTO_USER_INFO},
    oidcTriggerRefreshWhenIdTokenExpired: ${OIDC_TRIGGER_REFRESH_WHEN_ID_TOKEN_EXPIRED},
    oidcLogLevel: ${OIDC_LOG_LEVEL},
    oidcRedirectUri: "${OIDC_REDIRECT_URI}",
    oidcPostLogoutRedirectUri: "${OIDC_POST_LOGOUT_REDIRECT_URI}",
    oidcTokenEndpoint: "${OIDC_TOKEN_ENDPOINT}",
    oidcAuthorizationEndpoint: "${OIDC_AUTHORIZATION_ENDPOINT}",
    oidcUserInfoEndpoint: "${OIDC_USER_INFO_ENDPOINT}",
    oidcEndSessionEndpoint: "${OIDC_END_SESSION_ENDPOINT}"
  };
})(window);
EOF
