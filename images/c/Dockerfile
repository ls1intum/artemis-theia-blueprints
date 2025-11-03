# Load the base-ide image, only copy from here
ARG BASE_IMAGE=ghcr.io/eclipse-theia/theia-ide/base-ide:latest

FROM ${BASE_IMAGE} AS base-ide

# Load the plugin image, only copy from here
FROM node:20-bullseye AS plugin-image

WORKDIR /home/theia

# Configure to skip download of puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy required configuration files
COPY yarn.lock yarn.lock

# Copy image specific files - this should overwrite the default files from the repository
COPY images/c/package.json .

COPY --from=base-ide /home/theia/plugins /home/theia/plugins

# Remove unnecessary files for the browser application
# Download plugins and build application production mode
# Use yarn autoclean to remove unnecessary files from package dependencies
RUN yarn --pure-lockfile --network-timeout 1000000 && \
    yarn download:plugins

# Assemble the application
# Adapted from https://github.com/ls1intum/artemis-c-docker/blob/main/Dockerfile
# Changed: Use theia user instead of artemis user, do not install python
FROM ubuntu:24.04 AS final-ide

WORKDIR /home/theia

# Copy node from plugin-image as it is required for Theia 
COPY --from=plugin-image /usr/local/bin/node /usr/local/bin/
COPY --from=plugin-image /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY --from=plugin-image /usr/local/lib/node_modules/ /home/theia/node_modules/
COPY --from=plugin-image /home/theia/node_modules/ /home/theia/node_modules/

# Make sure all sources are up to date
RUN apt update && \
    apt upgrade -y --autoremove && \
    apt install -y --no-install-recommends \
    findutils bzip2 e2fsprogs sudo adduser && \
    apt clean && rm -rf /var/lib/apt/lists/*

# Create theia user and directories
# Application will be copied to /home/theia
# Default workspace is located at /home/project
RUN adduser --system --group theia --uid 101
RUN chmod g+rw /home && \
    mkdir -p /home/project && \
    chown -R theia:theia /home/theia && \
    chown -R theia:theia /home/project

# Install required tools for tool creation and terminal usage: wget, apt-transport-https, update & upgrade packages, bash
RUN apt-get update && \
    apt-get install -y wget apt-transport-https bash gcc clang git gdb make && \
    apt-get upgrade -y

ENV HOME=/home/theia
WORKDIR /home/theia

# Copy application from builder-stage
COPY --from=base-ide --chown=theia:theia /home/theia /home/theia

# Copy additional plugins
COPY --from=plugin-image /home/theia/plugins /home/theia/plugins

# Copy the project configuration files
COPY --from=base-ide --chown=theia:theia /home/theia/project /home/project

EXPOSE 3000

# Specify default shell for Theia and the Built-In plugins directory
ENV SHELL=/bin/bash \
    THEIA_DEFAULT_PLUGINS=local-dir:/home/theia/plugins

# Use installed git instead of dugite
ENV USE_LOCAL_GIT=true

# Switch to Theia user
USER theia
WORKDIR /home/theia/applications/browser

# Launch the backend application via node
ENTRYPOINT [ "node", "/home/theia/applications/browser/lib/backend/main.js" ]

# Arguments passed to the application
CMD [ "/home/project", "--hostname=0.0.0.0" ]
