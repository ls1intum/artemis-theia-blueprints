#!/bin/bash
set -e

if [ "$STANDALONE_MODE" = "true" ]; then
    TEMPLATE="/home/theia/templates/${BUILD_SYSTEM}"
    if [ -d "$TEMPLATE" ]; then
        cp -rn "$TEMPLATE/." /home/project/
        # Make gradlew executable if present (cp does not preserve execute bit from COPY)
        [ -f /home/project/gradlew ] && chmod +x /home/project/gradlew
    fi
fi

exec node /home/theia/applications/browser/lib/backend/main.js "$@"
