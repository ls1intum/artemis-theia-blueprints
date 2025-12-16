#!/bin/bash

SERVER_PORT=${SERVER_PORT:-5556}
LAUNCHER_JAR=$(find /opt/jdt-ls/plugins -name "org.eclipse.equinox.launcher_*.jar" | head -n 1)

# Validate LAUNCHER_JAR exists
if [ -z "$LAUNCHER_JAR" ] || [ ! -f "$LAUNCHER_JAR" ]; then
  echo "ERROR: Could not find Eclipse Equinox launcher JAR." >&2
  echo "Search path: /opt/jdt-ls/plugins" >&2
  echo "Expected file pattern: org.eclipse.equinox.launcher_*.jar" >&2
  echo "Suggestion: Reinstall or update the JDT Language Server plugins." >&2
  exit 1
fi

# Wir erstellen ein Hilfs-Skript, das Java im STDIO-Modus startet.
# Wir entfernen -DSERVER_PORT, damit Java auf stdin/stdout reagiert.
cat <<EOF > /tmp/run-jdt.sh
#!/bin/bash
exec java \
  -Declipse.application=org.eclipse.jdt.ls.core.id1 \
  -Dosgi.bundles.defaultStartLevel=4 \
  -Declipse.product=org.eclipse.jdt.ls.core.product \
  -Dlog.level=ALL \
  -Xmx1G \
  --add-modules=ALL-SYSTEM \
  --add-opens=java.base/java.util=ALL-UNNAMED \
  --add-opens=java.base/java.lang=ALL-UNNAMED \
  -jar "${LAUNCHER_JAR}" \
  -configuration /opt/jdt-ls/config_linux \
  -data /opt/workspace
EOF

chmod +x /tmp/run-jdt.sh

echo "Starting Socat wrapper on port ${SERVER_PORT}..."
echo "Socat will launch JDT LS for each connection."

# Socat lauscht auf TCP und startet für jede Verbindung das Skript.
# reuseaddr: Erlaubt schnellen Neustart
# fork: Erlaubt neue Verbindungen (wichtig falls Theia die Verbindung neu aufbaut)
exec socat TCP-LISTEN:${SERVER_PORT},reuseaddr,fork EXEC:/tmp/run-jdt.sh