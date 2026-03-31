#!/bin/bash
set -e

if [ "$STANDALONE_MODE" = "true" ]; then
    if [ -z "$BUILD_SYSTEM" ]; then
        echo "ERROR: STANDALONE_MODE is set but BUILD_SYSTEM is unset or empty" >&2
        exit 1
    fi
    TEMPLATE="/home/theia/templates/${BUILD_SYSTEM}"
    if [ ! -d "$TEMPLATE" ]; then
        echo "ERROR: No template found for BUILD_SYSTEM='${BUILD_SYSTEM}' (looked in ${TEMPLATE})" >&2
        exit 1
    fi
    cp -rn "$TEMPLATE/." /home/project/
    # Make gradlew executable if present (cp does not preserve execute bit from COPY)
    [ -f /home/project/gradlew ] && chmod +x /home/project/gradlew
fi

exec node /home/theia/applications/browser/lib/backend/main.js "$@"
