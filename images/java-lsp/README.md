# Java Language Server Image

This directory contains the `ToolDockerfile` to build the `java-lsp` Docker image.

## Building the Image

To build the image, run the following command from the root of the project:

```bash
docker build -t java-lsp:latest -f images/java-lsp/ToolDockerfile .
```

## Running the Container

To run the container and expose the language server on port 5007, use the following command:

```bash
docker run -d -p 5007:5007 --name java-lsp java-lsp:latest
```

## Verifying the Server

To check the logs and ensure the server has started correctly, run:

```bash
docker logs java-lsp
```
