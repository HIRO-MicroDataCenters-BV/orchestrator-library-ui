#!/bin/bash
# Setup development environment variables

export PRODUCTION=false
export API_TARGET=http://localhost:30015
export DASHBOARD_TARGET=http://localhost:30016
export GRAFANA_TARGET=http://localhost:30000
export DEX_TARGET=http://localhost:30080
export COG_TARGET=https://dashboard.cog.hiro-develop.nl
export K8S_PROXY_TARGET=http://localhost:30020
export TOKEN_KEY=auth_token
export REFRESH_TOKEN_KEY=refresh_token
export USER_KEY=user
export OIDC_AUTHORITY=http://localhost:30015/dex
export OIDC_CLIENT_ID=authservice-oidc
export OIDC_CLIENT_SECRET=""
export OIDC_SCOPE="openid profile email groups"
export OIDC_RESPONSE_TYPE=code
export OIDC_SILENT_RENEW=true
export OIDC_USE_REFRESH_TOKEN=true
export OIDC_RENEW_TIME_BEFORE_TOKEN_EXPIRES_IN_SECONDS=60
export OIDC_HISTORY_CLEANUP_OFF=true
export OIDC_AUTO_USER_INFO=true
export OIDC_TRIGGER_REFRESH_WHEN_ID_TOKEN_EXPIRED=true
export OIDC_LOG_LEVEL=3
export OIDC_REDIRECT_URI=http://localhost:30015/authservice/oidc/callback
export OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:30015/auth/login
export OIDC_TOKEN_ENDPOINT=/dex/token
export OIDC_AUTHORIZATION_ENDPOINT=/dex/auth
export OIDC_USER_INFO_ENDPOINT=/dex/userinfo
export OIDC_END_SESSION_ENDPOINT=/dex/auth/logout

# Generate env.js for both src/ and public/ (dev and build)
./scripts/generate-env.sh > src/assets/env.js
./scripts/generate-env.sh > public/assets/env.js

echo "✅ Development environment configured"
