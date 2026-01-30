FROM eclipse-temurin:21-jdk-jammy

ARG JDTLS_VERSION=1.50.0
ARG JDTLS_URL=https://www.eclipse.org/downloads/download.php?file=/jdtls/milestones/${JDTLS_VERSION}/jdt-language-server-${JDTLS_VERSION}-202509041425.tar.gz

# Standard LS port - configurable via env
ENV LS_PORT=5000

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget tar socat && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/jdt-ls

RUN wget -q "${JDTLS_URL}" -O jdt-ls.tar.gz && \
    tar -xzf jdt-ls.tar.gz && \
    rm jdt-ls.tar.gz && \
    rm -rf config_win config_mac config_ss_win config_ss_mac config_ss_linux bin *.md LICENSE

RUN mkdir -p /opt/workspace

RUN addgroup --system app && adduser --system --group app
RUN chown -R app:app /opt/jdt-ls && chown -R app:app /opt/workspace

COPY images/languageserver/java/start-ls.sh /opt/start-ls.sh
RUN chmod +x /opt/start-ls.sh

USER app

EXPOSE 5000

ENTRYPOINT ["/opt/start-ls.sh"]
