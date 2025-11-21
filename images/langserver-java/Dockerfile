FROM eclipse-temurin:21-jdk-jammy

# Wir laden EXAKT die Version herunter, die du wolltest (1.53.0)
ARG JDTLS_URL=https://www.eclipse.org/downloads/download.php?file=/jdtls/milestones/1.53.0/jdt-language-server-1.53.0-202511192211.tar.gz

RUN apt-get update && apt-get install -y wget tar && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/jdt-ls

# Herunterladen, Entpacken und Aufräumen in einem Schritt
RUN wget -q "${JDTLS_URL}" -O jdt-ls.tar.gz && \
    tar -xzf jdt-ls.tar.gz && \
    rm jdt-ls.tar.gz && \
    rm -rf \
    config_win \
    config_mac \
    config_ss_win \
    config_ss_mac \
    config_ss_linux \
    bin \
    *.md \
    LICENSE

RUN mkdir -p /opt/workspace

COPY start-ls.sh /opt/start-ls.sh
RUN chmod +x /opt/start-ls.sh

EXPOSE 5556

ENTRYPOINT ["/opt/start-ls.sh"]

# # Starten mit einer Java-Basis
# FROM eclipse-temurin:21-jdk-jammy

# # Arbeitsverzeichnis im Container
# WORKDIR /app

# # Kopiere den vorgebauten Language Server in den Container
# # Stellen Sie sicher, dass sich Ihr "repository"-Ordner im Build-Kontext befindet
# COPY ./repository ./repository

# # Ein Start-Skript, das die Umgebungsvariablen verarbeitet
# COPY ./start-ls.sh ./start-ls.sh
# RUN chmod +x ./start-ls.sh

# # Dieser Befehl wird ausgeführt, wenn der Container startet
# ENTRYPOINT [ "./start-ls.sh" ]