# Theia IDE for Java with External Language Server

This image provides a Theia IDE configured for Java development, but with the language server running in a separate container instead of being embedded.

## Key Differences from Standard `java-17` Image

| Feature | `java-17` (Standard) | `theia-java-no-ls` (This Image) |
|---------|---------------------|--------------------------------|
| **Language Server** | Embedded in IDE | External container |
| **Communication** | stdio/IPC | TCP/IP (port 5000) |
| **Plugins** | `vscjava.vscode-java-pack` | Individual plugins + `theia-lsp` connector |
| **Architecture** | Monolithic | Distributed (2 containers) |
| **Scaling** | 1 IDE = 1 LS | Multiple IDEs can share 1 LS |

## What's Included

### IDE Container (`theia-java-no-ls`)
- Theia IDE (browser-based)
- Java 17 JDK (for compilation and execution)
- Maven (for dependency management)
- Git, SSH, Bash
- **theia-lsp extension** (connects to external language server via TCP)
- Java debugging extensions
- Java test runner
- Maven integration
- Project dependency viewer

### What's NOT Included
- ❌ Embedded language server (uses external one instead)
- ❌ Rust tooling (Java-only, unlike `theia-no-ls` which supports both)

## Plugin Configuration

This image uses **individual Java extensions** instead of the full pack to avoid downloading an embedded language server:

```json
{
  "theiaPlugins": {
    "theia-lsp": "...",                        // External LS connector
    "vscjava.vscode-java-debug": "...",       // Debugging support
    "vscjava.vscode-java-test": "...",        // Test runner
    "vscjava.vscode-maven": "...",            // Maven integration
    "vscjava.vscode-java-dependency": "..."   // Dependency viewer
  }
}
```

**Note:** We do NOT include:
- ❌ `vscjava.vscode-java-pack` (contains embedded language server)
- ❌ `redhat.java` (also contains embedded language server)

Instead, the `theia-lsp` extension connects to an external language server container via TCP.

## Usage

### With Docker Compose (Recommended)

```bash
cd theia-ls-setup
docker-compose -f docker-compose-java-only.yml up
```

Then open: http://localhost:3000

### Manual Container Setup

```bash
# Create shared volume
docker volume create project-data

# Start language server
docker run -d \
  --name java-language-server \
  -e LS_PORT=5000 \
  -e WORKSPACE_PATH=/home/project \
  -v project-data:/home/project \
  ghcr.io/ls1intum/theia/langserver-java:latest

# Start IDE
docker run -d \
  --name theia-java-ide \
  -p 3000:3000 \
  -e LS_JAVA_HOST=java-language-server \
  -e LS_JAVA_PORT=5000 \
  -v project-data:/home/project \
  --link java-language-server \
  ghcr.io/ls1intum/theia/theia-java-no-ls:latest
```

## Environment Variables

### IDE Container
| Variable | Description | Default |
|----------|-------------|---------|
| `LS_JAVA_HOST` | Hostname of Java language server | `java-language-server` |
| `LS_JAVA_PORT` | Port for Java language server | `5000` |

### Language Server Container
| Variable | Description | Default |
|----------|-------------|---------|
| `LS_PORT` | TCP port to listen on | `5000` |
| `WORKSPACE_PATH` | Path to workspace directory | `/home/project` |

## Building Locally

```bash
# Build base image first (if not already built)
docker build -t ghcr.io/ls1intum/theia/base \
  -f images/base-ide/BaseDockerfile .

# Build this image
docker build -t ghcr.io/ls1intum/theia/theia-java-no-ls \
  --build-arg BASE_IDE_TAG=latest \
  -f images/theia-java-no-ls/ToolDockerfile .

# Build language server
docker build -t ghcr.io/ls1intum/theia/langserver-java \
  -f images/languageserver/java/Dockerfile .
```

## Troubleshooting

### No autocomplete or diagnostics

**Check language server connection:**
```bash
# View IDE logs
docker logs theia-java-ide | grep LSSERVICE

# Expected output:
# [LSSERVICE] First file for 'java' opened. Starting client to connect to java-language-server:5000
# [LSSERVICE] Successfully connected to java LS at java-language-server:5000
```

**Check language server is running:**
```bash
docker ps | grep language-server
docker logs java-language-server
```

**Test connectivity:**
```bash
docker exec theia-java-ide nc -zv java-language-server 5000
# Should output: Connection to java-language-server 5000 port [tcp/*] succeeded!
```

### Files not visible in language server

**Verify shared volume:**
```bash
# Check IDE can see files
docker exec theia-java-ide ls -la /home/project

# Check LS can see files
docker exec java-language-server ls -la /home/project

# Both should show the same files
```

## When to Use This Image

**Use `theia-java-no-ls` when:**
- ✅ Running in Kubernetes/orchestrated environments
- ✅ Need to scale IDE and LS independently
- ✅ Want to share language servers across multiple IDE instances
- ✅ Security/isolation requirements (process separation)
- ✅ Different update cycles for IDE vs LS

**Use standard `java-17` when:**
- ✅ Simple single-user development
- ✅ Lower operational complexity preferred
- ✅ Network isolation is a concern
- ✅ Self-contained deployment required
