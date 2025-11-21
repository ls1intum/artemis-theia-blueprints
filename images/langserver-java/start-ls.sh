#!/bin/bash

# Standard Port
SERVER_PORT=${SERVER_PORT:-5556}

# Launcher finden
LAUNCHER_JAR=$(find /opt/jdt-ls/plugins -name "org.eclipse.equinox.launcher_*.jar" | head -n 1)

echo "Starting JDT Language Server (v1.53.0) listening on port ${SERVER_PORT}..."

exec java \
  -Declipse.application=org.eclipse.jdt.ls.core.id1 \
  -Dosgi.bundles.defaultStartLevel=4 \
  -Declipse.product=org.eclipse.jdt.ls.core.product \
  -Dlog.level=ALL \
  -DSERVER_PORT=${SERVER_PORT} \
  --add-modules=ALL-SYSTEM \
  --add-opens=java.base/java.util=ALL-UNNAMED \
  --add-opens=java.base/java.lang=ALL-UNNAMED \
  -Xmx1G \
  -noverify \
  -jar "${LAUNCHER_JAR}" \
  -configuration /opt/jdt-ls/config_linux \
  -data /opt/workspace

  
# #!/bin/bash

# # Standardwerte, falls keine Umgebungsvariablen gesetzt sind
# THEIA_HOST=${THEIA_HOST:-localhost}
# THEIA_PORT=${THEIA_PORT:-3333}

# echo "Language Server startet... Verbinde mit Theia auf ${THEIA_HOST}:${THEIA_PORT}"

# # Finde die Launcher JAR-Datei dynamisch
# LAUNCHER_JAR=$(find /app/repository/plugins -name "org.eclipse.equinox.launcher_*.jar")

# # Starte den Java Language Server und weise ihn an, sich mit Theia zu verbinden
# java \
#   -Declipse.application=org.eclipse.jdt.ls.core.id1 \
#   -Dosgi.bundles.defaultStartLevel=4 \
#   -Declipse.product=org.eclipse.jdt.ls.core.product \
#   -Dlog.level=ALL \
#   -DCLIENT_HOST=${THEIA_HOST} \
#   -DCLIENT_PORT=${THEIA_PORT} \
#   -noverify \
#   -Xmx1G \
#   -jar ${LAUNCHER_JAR} \
#   -configuration /app/repository/config_linux \
#   -data /app/workspace