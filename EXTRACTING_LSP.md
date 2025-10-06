# Externalizing the Java Language Server

This document outlines the steps taken to externalize the Java Language Server from the main Theia IDE container.

## 1. Creating a Theia Image without the Java Language Server

- A copy of the `images/java-17` directory was created and named `images/java-17-NoLSP`.
- The `package.json` file in `images/java-17-NoLSP` was modified to remove the `vscjava.vscode-java-pack` and `vscjava.vscode-java-dependency` plugins. This prevents the integrated Java language server from being installed.
- The `images/java-17-NoLSP/ToolDockerfile` was updated to copy its own `package.json` instead of the one from the original `images/java-17` directory.

## 2. Creating an External Java Language Server Image

- A new Docker image named `java-lsp` was created based on `openjdk:17-slim`.
- The `ToolDockerfile` for this image, located at `images/java-lsp/ToolDockerfile`, downloads and extracts the Red Hat Java language server from Open VSX.

## 3. Running the Services with Docker Compose

- A `docker-compose.yml` file was created to manage and orchestrate the different services.
- The `theia` service is built from the `java-17-NoLSP` image and runs on port `3000`.
- A `theia-with-lsp` service was added for comparison. It is built from the original `images/java-17` image and runs on port `3001`.
- The local workspace volume mount was removed from the `theia` service to ensure it runs in a completely isolated environment.
- The `java-lsp` service is built from the `java-lsp` image and exposes port `5007` for the language server.
