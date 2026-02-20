# Theia IDE for Rust with External Language Server (Experimental)

This image provides a **swappable language server architecture** for Rust development in Theia IDE. The language server runs in a separate container, allowing you to experiment with different Rust language servers while maintaining the same IDE setup.

## 🎯 Design Goals

- **Swappable Architecture**: Test different Rust language servers (rust-analyzer, custom implementations, etc.)
- **Generic LSP Client**: Uses `theia-lsp` extension (protocol-agnostic, works with ANY LSP-compliant server)
- **Experimental Platform**: Research and compare language server implementations
- **No Embedded Servers**: Language servers run externally via TCP, not embedded in IDE

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────┐
│   Theia IDE Container               │
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
│  - rust-analyzer (default)          │
│  - OR any other Rust LSP server     │
│  - Listens on TCP port 5000         │
└─────────────────────────────────────┘
```

## 📦 What's Included

### IDE Container (`theia-rust-no-ls`)
- Theia IDE (browser-based)
- Rust toolchain (rustc, cargo, rustup)
- Git, SSH, Bash
- **theia-lsp extension** (generic LSP client, connects via TCP)
- **NO Rust-specific extensions** (clean, minimal setup)

### Language Server Container (Default: rust-analyzer)
- rust-analyzer (official Rust language server)
- **Full Rust toolchain** (rustc, cargo) - required by rust-analyzer
- Exposed via TCP on port 5000
- **Swappable**: Replace with any LSP-compliant Rust server
- Runs as UID 101 (matches Theia user for shared volume access)

## 🚀 Usage

### With Docker Compose (Recommended)

```bash
cd theia-ls-setup
docker-compose -f docker-compose-rust-only.yml up
```

Then open: http://localhost:3000

### Manual Container Setup

```bash
# Create shared volume
docker volume create project-data

# Start language server (rust-analyzer)
docker run -d \
  --name rust-language-server \
  -e LS_PORT=5000 \
  -v project-data:/home/project \
  ghcr.io/ls1intum/theia/langserver-rust:latest

# Start IDE
docker run -d \
  --name theia-rust-ide \
  -p 3000:3000 \
  -e LS_RUST_HOST=rust-language-server \
  -e LS_RUST_PORT=5000 \
  -v project-data:/home/project \
  --link rust-language-server \
  ghcr.io/ls1intum/theia/theia-rust-no-ls:latest
```

## 🔄 Swapping Language Servers

This architecture allows you to test different Rust language servers:

### Option 1: rust-analyzer (Default - Full Features)
```bash
docker run -d --name rust-ls \
  ghcr.io/ls1intum/theia/langserver-rust:latest
```

### Option 2: Custom/Alternative Rust Server
```bash
# Example: Your custom Rust LSP server
docker run -d --name rust-ls \
  -p 5000:5000 \
  your-custom-rust-lsp-server:latest
```

### Option 3: Lightweight Rust Server
```bash
# Example: A minimal Rust server for testing
docker run -d --name rust-ls \
  -p 5000:5000 \
  minimal-rust-lsp:latest
```

**No IDE changes needed!** Just restart the IDE container pointing to the new server.

## ⚙️ Environment Variables

### IDE Container

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LS_RUST_HOST` | Hostname of Rust language server | `rust-language-server` | Yes |
| `LS_RUST_PORT` | Port for Rust language server | `5000` | Yes |

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
docker build -t ghcr.io/ls1intum/theia/theia-rust-no-ls \
  --build-arg BASE_IDE_TAG=latest \
  -f images/theia-rust-no-ls/ToolDockerfile .

# Build language server (rust-analyzer)
docker build -t ghcr.io/ls1intum/theia/langserver-rust \
  -f images/languageserver/rust/Dockerfile .
```

## 🔍 Troubleshooting

### No autocomplete or diagnostics

**Check theia-lsp connection:**
```bash
# View IDE browser console (F12 in browser)
# Expected output:
# [LSSERVICE] First file for 'rust' opened. Starting client to connect to rust-language-server:5000
# [LSSERVICE] Successfully connected to rust LS at rust-language-server:5000
```

**Check language server is running:**
```bash
docker ps | grep language-server
docker logs rust-language-server
```

**Test connectivity:**
```bash
docker exec theia-rust-ide nc -zv rust-language-server 5000
# Should output: Connection to rust-language-server 5000 port [tcp/*] succeeded!
```

### Files not visible in language server

**Verify shared volume:**
```bash
# Check IDE can see files
docker exec theia-rust-ide ls -la /home/project

# Check LS can see files
docker exec rust-language-server ls -la /home/project

# Both should show the same files
```

### Cargo.toml not recognized

**Ensure Cargo.toml is in workspace root:**
```bash
# Check workspace structure
docker exec theia-rust-ide ls -la /home/project
# Should see: Cargo.toml, src/, etc.
```

**Note**: rust-analyzer requires a valid Cargo.toml to initialize the workspace.

### Permission errors (Cargo.lock write failures)

**Symptom**: Language server logs show "Permission denied" when writing Cargo.lock

**Cause**: UID mismatch between IDE and LS containers

**Solution**: Both containers must run as the same UID (101). Verify:
```bash
# Check IDE container user
docker exec theia-rust-ide id
# Should show: uid=101(theia) gid=101(theia)

# Check LS container user  
docker exec rust-language-server id
# Should show: uid=101(app) gid=101(app)
```

If UIDs don't match, the language server won't be able to create `Cargo.lock` or `target/` directories.

### "Failed to load workspaces" error

**Symptom**: rust-analyzer shows "Failed to load workspaces" in logs

**Possible causes:**
1. **Missing cargo**: rust-analyzer needs `cargo` to run `cargo metadata`
   ```bash
   docker exec rust-language-server cargo --version
   # Should output: cargo 1.87.0 or similar
   ```

2. **Invalid Cargo.toml**: Check your Cargo.toml syntax
   ```bash
   docker exec rust-language-server cargo metadata --manifest-path /home/project/Cargo.toml
   # Should output valid JSON, not errors
   ```

3. **Permission issues**: See section above about UID mismatch

## 🎯 When to Use This Image

**Use `theia-rust-no-ls` when:**
- ✅ **Experimenting with different Rust language servers**
- ✅ Research comparing rust-analyzer vs alternatives
- ✅ Testing custom/minimal language server implementations
- ✅ Need swappable LS architecture
- ✅ Running in Kubernetes/orchestrated environments
- ✅ Want to share language servers across multiple IDE instances
- ✅ Security/isolation requirements (process separation)

**Use standard Rust image when:**
- ✅ Simple single-user development
- ✅ Production-stable, well-tested setup
- ✅ Lower operational complexity preferred
- ✅ Self-contained deployment required

## 🧪 Experimental Status

This image is designed for **research and experimentation**. The swappable architecture is ideal for:
- Testing different language server implementations
- Comparing performance and features
- Educational purposes
- Prototyping custom tooling

**For production use**, consider a standard embedded setup with well-tested extensions.

## ⚠️ Important Requirements

### Language Server Must Include:
1. **Full Rust toolchain**: rust-analyzer requires `cargo` and `rustc` to analyze projects
2. **Matching UID**: Language server must run as UID 101 to access shared workspace volume
3. **LSP-compliant protocol**: Must implement Language Server Protocol correctly
4. **TCP socket**: Must listen on configured port (default 5000) and handle stdin/stdout over socket

### Example Dockerfile for Custom Rust LS:
```dockerfile
FROM alpine:3.22

RUN apk add --no-cache socat rust-analyzer rust cargo

# Critical: Use UID 101 to match Theia container
RUN addgroup -g 101 -S app && adduser -u 101 -S app -G app

USER app
WORKDIR /home/project

EXPOSE 5000
CMD socat TCP-LISTEN:5000,reuseaddr,fork EXEC:rust-analyzer
```

## 📚 Technical References

- **theia-lsp extension**: `/Users/nikolas/BA Workdir/theia-lsp-extension/`
- **rust-analyzer**: https://rust-analyzer.github.io/
- **LSP Specification**: https://microsoft.github.io/language-server-protocol/
