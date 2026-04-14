#!/bin/bash
set -e

TEMPLATES_DIR="/home/theia/templates"

if [ -n "$TEMPLATE" ]; then
    TEMPLATE_PATH="${TEMPLATES_DIR}/${TEMPLATE}"
    if [ ! -d "$TEMPLATE_PATH" ]; then
        echo "ERROR: No template found for '${TEMPLATE}'" >&2
        if [ -d "$TEMPLATES_DIR" ]; then
            echo "Available templates:" >&2
            ls -1 "$TEMPLATES_DIR" >&2
        fi
        exit 1
    fi
    echo "Loading template '${TEMPLATE}'..."
    cp -rn "$TEMPLATE_PATH/." /home/project/
    # Make gradlew executable if present (cp does not preserve execute bit from COPY)
    [ -f /home/project/gradlew ] && chmod +x /home/project/gradlew
fi

exec node /home/theia/applications/browser/lib/backend/main.js "$@"
