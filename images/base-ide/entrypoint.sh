#!/bin/bash
set -e

if [ "$STANDALONE_MODE" = "true" ]; then
    TEMPLATE="/home/theia/templates/${BUILD_SYSTEM}"
    if [ -d "$TEMPLATE" ]; then
        cp -rn "$TEMPLATE/." /home/project/
    fi
fi

exec node /home/theia/applications/browser/lib/backend/main.js "$@"
