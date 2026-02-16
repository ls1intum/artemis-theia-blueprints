# Creating Java-Only External Language Server Image

## Decision: Why NOT Disable Internal LS?

### The Problem with "Disabling"

The current `theia-no-ls` image includes the `redhat.java` extension, which **contains an embedded Eclipse JDT-LS language server** (~50MB+). There's no clean way to "disable" it because:

1. **Plugin Architecture**: VS Code/Theia extensions that include language servers bundle the server as part of the extension package
2. **No Disable Flag**: There's no configuration flag to disable just the embedded LS while keeping the extension's UI features
3. **Wasted Bandwidth**: You'd download a 50MB+ extension with an embedded server you never use
4. **Confusion**: Having two language servers (embedded disabled + external enabled) creates potential conflicts

### The Solution: Use Individual Extensions

Instead of using extensions that bundle language servers, we use **individual extensions** that provide UI features without embedded servers:

| Extension | Contains LS? | Purpose |
|-----------|--------------|---------|
| ❌ `redhat.java` | **YES** (~50MB) | Language support with embedded JDT-LS |
| ❌ `vscjava.vscode-java-pack` | **YES** (via redhat.java) | Extension pack that installs redhat.java |
| ✅ `vscjava.vscode-java-debug` | **NO** | Debugging UI only |
| ✅ `vscjava.vscode-java-test` | **NO** | Test runner UI only |
| ✅ `vscjava.vscode-maven` | **NO** | Maven integration UI only |
| ✅ `vscjava.vscode-java-dependency` | **NO** | Dependency viewer UI only |
| ✅ `theia-lsp` | **NO** | TCP connector to external LS |

## Implementation: New Image `theia-java-no-ls`

### Directory Structure

```
images/
├── theia-no-ls/              # Multi-language (Java + Rust)
│   ├── ToolDockerfile
│   ├── package.json.patch    # Uses redhat.java (has embedded LS)
│   └── project/.theia/
├── theia-java-no-ls/         # NEW: Java-only, no embedded LS
│   ├── ToolDockerfile        # Java tooling only (no Rust)
│   ├── package.json.patch    # Individual extensions + theia-lsp
│   ├── project/.theia/
│   └── README.md
└── java-17/                  # Standard Java with embedded LS
    ├── ToolDockerfile
    └── package.json.patch    # Uses vscjava.vscode-java-pack
```

### Key Differences: `theia-java-no-ls` vs `theia-no-ls`

| Aspect | `theia-no-ls` | `theia-java-no-ls` |
|--------|---------------|-------------------|
| **Languages** | Java + Rust | Java only |
| **Java Plugins** | `redhat.java` (50MB+) | Individual extensions (~10MB total) |
| **Rust Tooling** | ✅ Installed | ❌ Not installed |
| **Image Size** | Larger | Smaller (~500MB reduction) |
| **Purpose** | Multi-language demo | Production Java-only |

### Key Differences: `theia-java-no-ls` vs `java-17`

| Aspect | `java-17` | `theia-java-no-ls` |
|--------|-----------|-------------------|
| **Language Server** | Embedded | External container |
| **Plugins** | `vscjava.vscode-java-pack` | Individual + `theia-lsp` |
| **Architecture** | Monolithic | Distributed |
| **Containers** | 1 | 2 (IDE + LS) |

## Files Created

### 1. `images/theia-java-no-ls/ToolDockerfile`

**Key Points:**
- Based on `java-17/ToolDockerfile` structure (optimized, parallel builds)
- **Removed**: Rust installation steps
- **Added**: Same as java-17, just different plugins via package.json.patch

### 2. `images/theia-java-no-ls/package.json.patch`

**Critical Difference from `theia-no-ls`:**

```diff
- "redhat.java": "..."  // REMOVED: Contains embedded LS
+ "theia-lsp": "..."    // ADDED: External LS connector
+ "vscjava.vscode-java-debug": "..."    // Individual extension
+ "vscjava.vscode-java-test": "..."     // Individual extension
+ "vscjava.vscode-maven": "..."         // Individual extension
+ "vscjava.vscode-java-dependency": "..." // Individual extension
```

**Why this works:**
- `theia-lsp` extension activates on `onLanguage:java`
- When a `.java` file opens, it connects to external LS via TCP
- Individual extensions provide UI features (debug, test, maven)
- No embedded LS is downloaded or started

### 3. `images/theia-java-no-ls/project/.theia/settings.json`

Same as `java-17` - disables telemetry and help notifications.

### 4. `theia-ls-setup/docker-compose-java-only.yml`

Ready-to-use test setup with:
- `theia-java-no-ls` IDE container
- `langserver-java` external LS container
- Shared volume for workspace

## Build & Test Instructions

### 1. Build the Image

```bash
cd /Users/nikolas/BA\ Workdir/artemis-theia-blueprints

# Build base (if needed)
docker build -t ghcr.io/ls1intum/theia/base -f images/base-ide/BaseDockerfile .

# Build theia-java-no-ls
docker build -t ghcr.io/ls1intum/theia/theia-java-no-ls \
  --build-arg BASE_IDE_TAG=latest \
  -f images/theia-java-no-ls/ToolDockerfile .
```

### 2. Test with Docker Compose

```bash
cd theia-ls-setup
docker-compose -f docker-compose-java-only.yml up
```

Open browser: http://localhost:3000

### 3. Verify Connection

Create a test Java file in the IDE:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
        // Type here and check autocomplete works
    }
}
```

**Check browser console:**
```
[LSSERVICE] Language is supported and client is not running
[LSSERVICE] First file for 'java' opened. Starting client to connect to java-language-server:5000
[LSSERVICE] Successfully connected to java LS at java-language-server:5000
```

**Check IDE logs:**
```bash
docker logs theia-java-ide | grep LSSERVICE
```

## Add to CI/CD Pipeline

Add this to `.github/workflows/build.yml`:

```yaml
matrix:
  include:
    # ... existing images ...
    - docker-file: images/theia-java-no-ls/ToolDockerfile
      docker-context: "."
      image-name: ls1intum/theia/theia-java-no-ls
```

## Alternative Approach (Not Recommended)

### Why NOT Copy `java-17` and Try to Disable LS?

You could theoretically:
1. Copy `java-17` image
2. Keep `vscjava.vscode-java-pack` (which includes redhat.java)
3. Add `theia-lsp` extension
4. Try to configure `theia-lsp` to intercept before redhat.java starts

**Problems:**
- ❌ Both extensions compete to start language servers
- ❌ Download 50MB+ of embedded LS you won't use
- ❌ No guarantee of which extension activates first
- ❌ Potential conflicts between two LS implementations
- ❌ More complex configuration
- ❌ Harder to debug issues

## Recommendation

✅ **Use the new `theia-java-no-ls` image** as created above because:

1. **Clean Architecture**: Only downloads what's needed
2. **No Conflicts**: No embedded LS to compete with external one
3. **Smaller Image**: ~500MB smaller than including `redhat.java`
4. **Clear Intent**: Name makes it obvious this connects to external LS
5. **Maintainable**: Follows same pattern as other images (java-17, rust, python)
6. **Production Ready**: Based on battle-tested `java-17` Dockerfile structure

## Next Steps

1. ✅ Test locally with docker-compose
2. ✅ Verify all Java features work (autocomplete, diagnostics, go-to-definition, debugging)
3. ✅ Add to CI/CD pipeline
4. ✅ Update documentation
5. ⬜ Deploy to production environment
6. ⬜ Monitor performance and resource usage
7. ⬜ Consider creating similar images for other languages (Python, TypeScript, etc.)
