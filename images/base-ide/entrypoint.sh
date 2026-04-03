#!/bin/bash
set -e

TEMPLATES_DIR="/home/theia/templates"

# Determine which template to use.
# Preferred: TEMPLATE env var (e.g. TEMPLATE=gradle)
# Legacy:    STANDALONE_MODE=true + BUILD_SYSTEM=gradle (backward compatible)
SELECTED_TEMPLATE=""
if [ -n "$TEMPLATE" ]; then
    SELECTED_TEMPLATE="$TEMPLATE"
elif [ "$STANDALONE_MODE" = "true" ]; then
    if [ -z "$BUILD_SYSTEM" ]; then
        echo "ERROR: STANDALONE_MODE is set but BUILD_SYSTEM is unset or empty" >&2
        exit 1
    fi
    SELECTED_TEMPLATE="$BUILD_SYSTEM"
fi

if [ -n "$SELECTED_TEMPLATE" ]; then
    TEMPLATE_PATH="${TEMPLATES_DIR}/${SELECTED_TEMPLATE}"
    if [ ! -d "$TEMPLATE_PATH" ]; then
        echo "ERROR: No template found for '${SELECTED_TEMPLATE}'" >&2
        # List available templates if the directory exists
        if [ -d "$TEMPLATES_DIR" ]; then
            echo "Available templates:" >&2
            ls -1 "$TEMPLATES_DIR" >&2
        fi
        exit 1
    fi
    echo "Loading template '${SELECTED_TEMPLATE}'..."
    cp -rn "$TEMPLATE_PATH/." /home/project/
    # Make gradlew executable if present (cp does not preserve execute bit from COPY)
    [ -f /home/project/gradlew ] && chmod +x /home/project/gradlew
fi

exec node /home/theia/applications/browser/lib/backend/main.js "$@"
