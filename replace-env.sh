#!/bin/bash
set -e

echo "🔧 Angular Environment Variable Replacement Script"
echo "=================================================="

# Define the target file paths
BROWSER_DIR="/usr/app/dist/orchestration_library-front/browser"
ENV_FILE="$BROWSER_DIR/main-*.js"

# Check if browser directory exists
if [ ! -d "$BROWSER_DIR" ]; then
    echo "❌ Browser directory not found: $BROWSER_DIR"
    exit 1
fi

# Find the main JavaScript file
MAIN_JS_FILE=$(find "$BROWSER_DIR" -name "main.*.js" -type f | head -1)

if [ -z "$MAIN_JS_FILE" ]; then
    echo "❌ Main JavaScript file not found in $BROWSER_DIR"
    exit 1
fi

echo "📁 Found main JS file: $(basename "$MAIN_JS_FILE")"

# Create backup
cp "$MAIN_JS_FILE" "$MAIN_JS_FILE.backup"
echo "💾 Created backup: $(basename "$MAIN_JS_FILE").backup"

# Replace environment variables in the main JavaScript file
echo "🔄 Replacing environment variables..."

# OIDC Configuration
if [ -n "$OIDC_AUTHORITY" ]; then
    sed -i "s|\${OIDC_AUTHORITY}|$OIDC_AUTHORITY|g" "$MAIN_JS_FILE"
    echo "   ✅ OIDC_AUTHORITY"
fi

if [ -n "$OIDC_CLIENT_ID" ]; then
    sed -i "s|\${OIDC_CLIENT_ID}|$OIDC_CLIENT_ID|g" "$MAIN_JS_FILE"
    echo "   ✅ OIDC_CLIENT_ID"
fi

if [ -n "$OIDC_CLIENT_SECRET" ]; then
    sed -i "s|\${OIDC_CLIENT_SECRET}|$OIDC_CLIENT_SECRET|g" "$MAIN_JS_FILE"
    echo "   ✅ OIDC_CLIENT_SECRET"
fi

if [ -n "$OIDC_REDIRECT_URI" ]; then
    sed -i "s|\${OIDC_REDIRECT_URI}|$OIDC_REDIRECT_URI|g" "$MAIN_JS_FILE"
    echo "   ✅ OIDC_REDIRECT_URI"
fi

if [ -n "$OIDC_POST_LOGOUT_REDIRECT_URI" ]; then
    sed -i "s|\${OIDC_POST_LOGOUT_REDIRECT_URI}|$OIDC_POST_LOGOUT_REDIRECT_URI|g" "$MAIN_JS_FILE"
    echo "   ✅ OIDC_POST_LOGOUT_REDIRECT_URI"
fi

# API URLs (optional overrides)
if [ -n "$API_URL" ]; then
    sed -i "s|/api|$API_URL|g" "$MAIN_JS_FILE"
    echo "   ✅ API_URL"
fi

if [ -n "$GRAFANA_URL" ]; then
    sed -i "s|/iframe-grafana|$GRAFANA_URL|g" "$MAIN_JS_FILE"
    echo "   ✅ GRAFANA_URL"
fi

if [ -n "$DASHBOARD_URL" ]; then
    sed -i "s|/iframe-dashboard|$DASHBOARD_URL|g" "$MAIN_JS_FILE"
    echo "   ✅ DASHBOARD_URL"
fi

if [ -n "$COG_URL" ]; then
    sed -i "s|/iframe-cog|$COG_URL|g" "$MAIN_JS_FILE"
    echo "   ✅ COG_URL"
fi

# Verify replacements
echo ""
echo "🔍 Verification:"
REMAINING_PLACEHOLDERS=$(grep -o '\${[^}]*}' "$MAIN_JS_FILE" || true)

if [ -n "$REMAINING_PLACEHOLDERS" ]; then
    echo "⚠️  Remaining placeholders found:"
    echo "$REMAINING_PLACEHOLDERS" | sort | uniq
    echo ""
    echo "ℹ️  These will use default values or may cause runtime errors."
else
    echo "✅ All placeholders have been replaced successfully!"
fi

# Log configuration (without secrets)
echo ""
echo "📊 Configuration Summary:"
echo "   Production: true"
echo "   OIDC Authority: ${OIDC_AUTHORITY:-'not set'}"
echo "   OIDC Client ID: ${OIDC_CLIENT_ID:-'not set'}"
echo "   OIDC Client Secret: ${OIDC_CLIENT_SECRET:+***configured***}"
echo "   Redirect URI: ${OIDC_REDIRECT_URI:-'not set'}"
echo "   Post Logout URI: ${OIDC_POST_LOGOUT_REDIRECT_URI:-'not set'}"
echo "   API URL: ${API_URL:-'/api (default)'}"
echo "   Grafana URL: ${GRAFANA_URL:-'/iframe-grafana (default)'}"
echo "   Dashboard URL: ${DASHBOARD_URL:-'/iframe-dashboard (default)'}"
echo "   COG URL: ${COG_URL:-'/iframe-cog (default)'}"

echo ""
echo "✅ Environment variable replacement completed successfully!"
