# Theia IDE for Java with External Language Server (Experimental)

This image provides a **swappable language server architecture** for Java development in Theia IDE. The language server runs in a separate container, allowing you to experiment with different Java language servers while maintaining the same IDE setup.

## 🎯 Design Goals

- **Swappable Architecture**: Test different Java language servers (JDT-LS, custom implementations, etc.)
- **Generic LSP Client**: Uses `theia-lsp` extension (protocol-agnostic, works with ANY LSP-compliant server)
- **Experimental Platform**: Research and compare language server implementations
- **No Embedded Servers**: Language servers run externally via TCP, not embedded in IDE

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────┐
│   Theia IDE Container               │
│                                     │
│  ┌──────────────────────────┐      │
│  │  redhat.java (DORMANT)   │      │
│  │  - Installed but inactive│      │
│  │  - No LS started         │      │
│  └──────────────────────────┘      │
│                                     │
│  ┌──────────────────────────┐      │
│  │  theia-lsp (ACTIVE)      │──────┼──── TCP :5000 ───┐
│  │  - Generic LSP client    │      │                   │
│  │  - Connects to external  │      │                   │
│  └──────────────────────────┘      │                   │
└─────────────────────────────────────┘                   │
                                                          │
┌─────────────────────────────────────┐                   │
│  Language Server Container          │                   │
│                                     │◄──────────────────┘
│  - JDT-LS (default)                 │
│  - OR any other Java LSP server     │
│  - Listens on TCP port 5000         │
└─────────────────────────────────────┘
```

## 🔬 Understanding the Language Servers

### Red Hat's Java Extension (`redhat.java`) Modes

The `redhat.java` extension supports two language server types:

| Server Type | Features | Startup Time | Memory | When To Use |
|------------|----------|--------------|--------|-------------|
| **Syntax Server** | Basic syntax highlighting, document symbols, simple diagnostics | ~2s | ~100-200MB | Quick edits, no IntelliSense needed |
| **Standard Server** | Full JDT-LS: autocomplete, refactoring, navigation, hover, project analysis, Maven/Gradle | ~10-30s | ~500MB-2GB | Full development experience |

### Our Configuration

This image **disables BOTH** servers in `redhat.java` using the "Debug Mismatch" technique, then uses `theia-lsp` as the active client.

## 🔧 How It Works: The "Debug Mismatch" Trick

The `redhat.java` extension has logic to skip server startup when environment variables create a specific mismatch:

**From `redhat.java` source code (`extension.ts`):**
```typescript
const isDebugModeByClientPort = !!process.env['SYNTAXLS_CLIENT_PORT'] || !!process.env['JDTLS_CLIENT_PORT'];
const requireSyntaxServer = (serverMode !== ServerMode.standard) && 
    (!isDebugModeByClientPort || !!process.env['SYNTAXLS_CLIENT_PORT']);
const requireStandardServer = (serverMode !== ServerMode.lightWeight) && 
    (!isDebugModeByClientPort || !!process.env['JDTLS_CLIENT_PORT']);
```

**Our Configuration:**
- Setting: `java.server.launchMode: "Standard"`
- Environment: `SYNTAXLS_CLIENT_PORT=0` (dummy value)
- Environment: `JDTLS_CLIENT_PORT` is **UNSET**

**Result:**
- `requireSyntaxServer = false` (because mode is Standard)
- `requireStandardServer = false` (because JDTLS_CLIENT_PORT is unset despite debug mode)
- `javaLSReady` context stays `false` → All UI commands hidden
- `redhat.java` remains installed but completely dormant
- `theia-lsp` becomes the ONLY active language client

## 📦 What's Included

### IDE Container (`java-17-no-ls`)
- Theia IDE (browser-based)
- Java 17 JDK (for compilation and execution)
- Maven (for dependency management)
- Git, SSH, Bash
- **theia-lsp extension** (generic LSP client, connects via TCP)
- **redhat.java extension** (installed but dormant, no server started)

### Language Server Container (Default: JDT-LS)
- Eclipse JDT-LS v1.50.0
- Exposed via TCP on port 5000
- **Swappable**: Replace with any LSP-compliant Java server

## 🚀 Usage

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

# Create network
docker network create theia-net

# Start language server (JDT-LS)
docker run -d \
  --name java-language-server \
  -e LS_PORT=5000 \
  -v project-data:/home/project \
  --network theia-net \
  ghcr.io/ls1intum/theia/langserver-java:latest

# Start IDE
docker run -d \
  --name theia-java-ide \
  -p 3000:3000 \
  -e LS_JAVA_HOST=java-language-server \
  -e LS_JAVA_PORT=5000 \
  -e SYNTAXLS_CLIENT_PORT=0 \
  -v project-data:/home/project \
  --network theia-net \
  ghcr.io/ls1intum/theia/java-17-no-ls:latest
```

## 🔄 Swapping Language Servers

This architecture allows you to test different Java language servers:

### Option 1: JDT-LS (Default - Full Features)
```bash
docker run -d --name java-ls \
  ghcr.io/ls1intum/theia/langserver-java:latest
```

### Option 2: Custom/Alternative Java Server
```bash
# Example: Your custom Java LSP server
docker run -d --name java-ls \
  -p 5000:5000 \
  your-custom-java-lsp-server:latest
```

### Option 3: Lightweight Java Server
```bash
# Example: A minimal Java server for testing
docker run -d --name java-ls \
  -p 5000:5000 \
  minimal-java-lsp:latest
```

**No IDE changes needed!** Just restart the IDE container pointing to the new server.

## ⚙️ Environment Variables

### IDE Container

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LS_JAVA_HOST` | Hostname of Java language server | `java-language-server` | Yes |
| `LS_JAVA_PORT` | Port for Java language server | `5000` | Yes |
| `SYNTAXLS_CLIENT_PORT` | Dummy value to disable redhat.java servers | `0` | Yes (for dormant mode) |
| `JDTLS_CLIENT_PORT` | Must be UNSET for dormant mode | - | Must NOT be set |

### Language Server Container

| Variable | Description | Default |
|----------|-------------|---------|
| `LS_PORT` | TCP port to listen on | `5000` |
| `WORKSPACE_PATH` | Path to workspace directory | `/home/project` |

## 🛠️ Building Locally

```bash
# Build base image first (if not already built)
docker build -t ghcr.io/ls1intum/theia/base \
  -f images/base-ide/BaseDockerfile .

# Build this image
docker build -t ghcr.io/ls1intum/theia/java-17-no-ls \
  --build-arg BASE_IDE_TAG=latest \
  -f images/java-17-no-ls/ToolDockerfile .

# Build language server (JDT-LS)
docker build -t ghcr.io/ls1intum/theia/langserver-java \
  -f images/languageserver/java/Dockerfile .
```

## 🔍 Troubleshooting

### No autocomplete or diagnostics

**Check theia-lsp connection:**
```bash
# View IDE browser console (F12 in browser)
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

### redhat.java showing errors or UI elements

**Verify dormant mode is active:**
```bash
# Check environment variables
docker exec theia-java-ide env | grep CLIENT_PORT

# Expected:
# SYNTAXLS_CLIENT_PORT=0
# JDTLS_CLIENT_PORT should NOT appear
```

**Check settings.json:**
```bash
docker exec theia-java-ide cat /home/project/.theia/settings.json
# Should contain: "java.server.launchMode": "Standard"
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

## 🎯 When to Use This Image

**Use `java-17-no-ls` when:**
- ✅ **Experimenting with different Java language servers**
- ✅ Research comparing JDT-LS vs alternatives
- ✅ Testing custom/minimal language server implementations
- ✅ Need swappable LS architecture
- ✅ Running in Kubernetes/orchestrated environments
- ✅ Want to share language servers across multiple IDE instances
- ✅ Security/isolation requirements (process separation)

**Use standard `java-17` when:**
- ✅ Simple single-user development
- ✅ Production-stable, well-tested setup
- ✅ Lower operational complexity preferred
- ✅ Self-contained deployment required

## 🧪 Experimental Status

This image is designed for **research and experimentation**. The "Debug Mismatch" technique exploits internal logic in `redhat.java` and may break in future versions of the extension.

**For production use**, consider:
- Removing `redhat.java` entirely (use only `theia-lsp`)
- OR using `redhat.java` with `JDTLS_CLIENT_PORT` to connect to external JDT-LS (official support)

## 📚 Technical References

- **theia-lsp extension**: [nikolashack.theia-lsp](https://open-vsx.org/extension/nikolashack/theia-lsp)
- **redhat.java source**: https://github.com/redhat-developer/vscode-java
- **JDT-LS documentation**: https://github.com/eclipse-jdtls/eclipse.jdt.ls
- **LSP Specification**: https://microsoft.github.io/language-server-protocol/
