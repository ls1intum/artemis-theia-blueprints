# External Language Server Testing Guide

This document provides comprehensive testing instructions for the External Language Server feature implemented in PR #80.

## Overview

The External Language Server feature allows Java and Rust language servers to run as separate containers/pods that communicate with Theia IDE over the network on port 5000. The workspace directory is shared between Theia and the language server, ensuring both have access to the same files.

## Key Features

- **Standardized Port**: All language servers use port 5000
- **Configurable Workspace Path**: Language servers use `WORKSPACE_PATH` environment variable (default: `/home/project`)
- **Shared Workspace**: Both Theia and LS access the same mounted volume
- **Docker Images**: 
  - `ghcr.io/ls1intum/theia/langserver-java:latest`
  - `ghcr.io/ls1intum/theia/langserver-rust:latest`
  - `ghcr.io/ls1intum/theia/theia-no-ls:latest`

---

## Phase 1: Local Docker Compose Testing

### Prerequisites

- Docker and Docker Compose installed
- Access to image registry (or build images locally)

### Test 1: Java Language Server

```bash
cd theia-ls-setup

# Start services
docker-compose -f docker-compose-java.yml up -d

# Wait for services to start
sleep 15

# Check logs
docker logs java-language-server
# Expected output: "[LS-JAVA] Starting Java Language Server on port 5000 with workspace /home/project"

docker logs theia-ide
# Should show Theia starting successfully

# Access Theia IDE
open http://localhost:3000
```

**In Theia IDE:**

1. **Create a simple Java file**:
   - Click "File" → "New File"
   - Name it `HelloWorld.java`
   - Add the following code:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

2. **Verify Language Server Features**:
   - ✅ **Syntax Highlighting**: Code should be colorized
   - ✅ **Code Completion**: Type `System.` and wait - you should see autocomplete suggestions
   - ✅ **Error Detection**: Type `public class Test {` without closing brace - you should see red underline
   - ✅ **Hover Documentation**: Hover over `System` - you should see documentation popup
   - ✅ **Go to Definition**: Right-click on `String` → "Go to Definition"

3. **Check Browser Console** (F12):
   - Look for `[LSP-EXT]` logs showing connection to Java LS
   - Should see: `[LSP-EXT] Connecting to java LS at java-language-server:5000`
   - Should see: `[LSP-EXT] Connected to java LS`

4. **Verify Shared Workspace**:
   ```bash
   # Create a file from language server container
   docker exec java-language-server sh -c 'echo "Created by LS" > /home/project/test-from-ls.txt'
   
   # Refresh Theia file explorer - you should see test-from-ls.txt
   # Open it - should contain "Created by LS"
   ```

**Cleanup:**
```bash
docker-compose -f docker-compose-java.yml down -v
```

### Test 2: Rust Language Server

```bash
cd theia-ls-setup

# Start services
docker-compose -f docker-compose-rust.yml up -d

sleep 15

# Check logs
docker logs rust-language-server
# Expected: "[LS-RUST] Starting Rust Language Server on port 5000 with workspace /home/project"

# Access Theia
open http://localhost:3000
```

**In Theia IDE:**

1. **Create a Rust project structure**:
   - Create folder: `hello-rust`
   - Create file: `hello-rust/Cargo.toml` with:

```toml
[package]
name = "hello-rust"
version = "0.1.0"
edition = "2021"
```

   - Create folder: `hello-rust/src`
   - Create file: `hello-rust/src/main.rs` with:

```rust
fn main() {
    println!("Hello, world!");
}
```

2. **Verify Language Server Features**:
   - ✅ **Syntax Highlighting**: Rust code should be colorized
   - ✅ **Code Completion**: Type `std::` - should see autocomplete
   - ✅ **Error Detection**: Type invalid Rust syntax - should see errors
   - ✅ **Hover Documentation**: Hover over `println!` - should see docs

3. **Check Browser Console**:
   - Look for `[LSP-EXT] Connecting to rust LS at rust-language-server:5000`
   - Should see successful connection message

**Cleanup:**
```bash
docker-compose -f docker-compose-rust.yml down -v
```

---

## Phase 2: Build and Verify Images Locally

If you need to test changes to the Dockerfiles:

```bash
# Build Java LS image
docker build -f images/languageserver/java/Dockerfile \
  -t ghcr.io/ls1intum/theia/langserver-java:test .

# Test Java LS standalone
docker run --rm \
  -e LS_PORT=5000 \
  -e WORKSPACE_PATH=/home/project \
  -v $(pwd)/test-workspace:/home/project \
  -p 5000:5000 \
  ghcr.io/ls1intum/theia/langserver-java:test

# In another terminal, test connection
nc -zv localhost 5000
# Should show: Connection to localhost port 5000 [tcp/*] succeeded!

# Build Rust LS image
docker build -f images/languageserver/rust/Dockerfile \
  -t ghcr.io/ls1intum/theia/langserver-rust:test .

# Test Rust LS standalone
docker run --rm \
  -e LS_PORT=5000 \
  -e WORKSPACE_PATH=/home/project \
  -v $(pwd)/test-workspace:/home/project \
  -p 5001:5000 \
  ghcr.io/ls1intum/theia/langserver-rust:test

# Build theia-no-ls image
docker build -f images/theia-no-ls/ToolDockerfile \
  --build-arg BASE_IDE_TAG=latest \
  -t ghcr.io/ls1intum/theia/theia-no-ls:test .
```

---

## Phase 3: Configuration Verification

### Test Different Workspace Paths

```bash
# Test Java LS with custom workspace path
docker run --rm \
  -e LS_PORT=5000 \
  -e WORKSPACE_PATH=/custom/workspace \
  -v $(pwd)/test-workspace:/custom/workspace \
  -p 5000:5000 \
  ghcr.io/ls1intum/theia/langserver-java:test

# Check logs - should show:
# "[LS-JAVA] Starting Java Language Server on port 5000 with workspace /custom/workspace"
```

### Test Different Ports

```bash
# Test with custom port
docker run --rm \
  -e LS_PORT=9000 \
  -e WORKSPACE_PATH=/home/project \
  -p 9000:9000 \
  ghcr.io/ls1intum/theia/langserver-java:test

# Test connection
nc -zv localhost 9000
```

---

## Expected Results Summary

| Test | Expected Outcome |
|------|------------------|
| **Docker Compose Java** | Java LS connects on port 5000, provides code completion, error detection, and hover docs |
| **Docker Compose Rust** | Rust LS connects on port 5000, provides Rust language features |
| **Shared Workspace** | Files created in LS container are visible in Theia and vice versa |
| **Custom Workspace Path** | LS respects `WORKSPACE_PATH` environment variable |
| **Custom Port** | LS respects `LS_PORT` environment variable |
| **Standalone LS** | Language servers can run independently and accept TCP connections |

---

## Troubleshooting

### Language Server Not Connecting

1. **Check logs**:
   ```bash
   docker logs java-language-server
   docker logs rust-language-server
   ```

2. **Verify network connectivity**:
   ```bash
   docker exec theia-ide ping -c 3 java-language-server
   docker exec theia-ide nc -zv java-language-server 5000
   ```

3. **Check environment variables**:
   ```bash
   docker exec java-language-server env | grep LS_
   docker exec theia-ide env | grep LS_
   ```

### No Code Completion

1. **Check browser console** for `[LSP-EXT]` errors
2. **Verify file extensions**: Java LS only activates for `.java` files
3. **Wait for initialization**: Language servers may take 5-10 seconds to fully initialize

### Workspace Files Not Syncing

1. **Verify volume mounts**:
   ```bash
   docker inspect java-language-server | grep -A 10 Mounts
   docker inspect theia-ide | grep -A 10 Mounts
   ```

2. **Check WORKSPACE_PATH**:
   ```bash
   docker exec java-language-server sh -c 'echo $WORKSPACE_PATH'
   ```

3. **List files in both containers**:
   ```bash
   docker exec theia-ide ls -la /home/project
   docker exec java-language-server ls -la /home/project
   ```

---

## Integration with Kubernetes

For Kubernetes testing, see the companion document in the `theia-cloud` repository:
- [theia-cloud/EXTERNAL_LS_TESTING.md](../theia-cloud/EXTERNAL_LS_TESTING.md)

---

## Success Criteria

- ✅ Docker Compose tests pass for both Java and Rust
- ✅ Language servers start on port 5000
- ✅ Code completion works in Theia IDE
- ✅ Workspace files are accessible from both Theia and LS containers
- ✅ Custom workspace paths can be configured
- ✅ No errors in browser console or container logs
