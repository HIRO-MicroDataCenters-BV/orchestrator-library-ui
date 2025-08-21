#!/bin/sh
set -e

echo "🔧 Replacing OIDC Client Secret in Angular build"
echo "==============================================="

# Find the main JavaScript file
BROWSER_DIR="/usr/app/dist/orchestration_library-front/browser"
MAIN_JS_FILE=$(find "$BROWSER_DIR" -name "main-*.js" -type f | head -1)

if [ -z "$MAIN_JS_FILE" ]; then
    echo "❌ Main JavaScript file not found"
    exit 1
fi

echo "📁 Found: $(basename "$MAIN_JS_FILE")"

# Replace ONLY the client secret placeholder
if [ -n "$OIDC_CLIENT_SECRET" ]; then
    sed -i "s|\${OIDC_CLIENT_SECRET}|$OIDC_CLIENT_SECRET|g" "$MAIN_JS_FILE"
    echo "✅ OIDC_CLIENT_SECRET replaced"
else
    echo "⚠️  OIDC_CLIENT_SECRET not provided - using placeholder"
fi

echo "✅ Replacement completed"
