# Base IDE Docker Image Size Analysis

**Current Image Size:** 999 MB  
**Target:** < 500 MB (50% reduction achievable)

## 📊 Size Breakdown

| Component | Size | % of Total |
|-----------|------|------------|
| node_modules | 619 MB | 62% |
| applications/browser | 243 MB | 24% |
| plugins | 39 MB | 4% |
| Base OS (node:22-bullseye-slim) | 74.5 MB | 7% |
| Other files | ~23 MB | 3% |

---

## 🔥 Quick Wins (Estimated Savings: 150-250 MB)

### 1. **Install Production Dependencies Only** (Est. savings: 100-150 MB)

**Problem:** devDependencies are installed in the final image.

**Evidence:**
- `typescript` (61 MB) - build-time only
- `lerna` (13 MB) - build-time only
- `webpack` (6.5 MB) - build-time only
- `eslint` + `@typescript-eslint` (9+ MB) - build-time only
- `node-gyp` (6.2 MB) - build-time only
- `@nrwl/nx` (15 MB combined) - build-time only

**Solution:**
```dockerfile
# In the final stage, reinstall ONLY production dependencies
RUN yarn install --production --ignore-scripts --prefer-offline
```

### 2. **Remove Documentation & Metadata Files** (Est. savings: 20-30 MB)

**Problem:** 11,584+ unnecessary files present:
- Source maps (`.map` files)
- README/CHANGELOG/LICENSE files in node_modules
- Markdown documentation (55 files in root alone)

**Evidence:**
```
/home/theia/README.md
/home/theia/NOTICE.md
/home/theia/PUBLISHING.md
/home/theia/CONTRIBUTING.md
/home/theia/TheiaIDE logo/ (1.4 MB)
/home/theia/browser.Dockerfile
/home/theia/Dockerfile
/home/theia/configs/
/home/theia/releng/
/home/theia/cleanup/
/home/theia/next/
/home/theia/scripts/
/home/theia/images/
```

**Solution:**
```dockerfile
# Enhanced cleanup in build stage
RUN find . -type f \( \
    -name '*.md' -o \
    -name '*.map' -o \
    -name 'LICENSE*' -o \
    -name 'CHANGELOG*' -o \
    -name 'NOTICE*' -o \
    -name '.npmignore' -o \
    -name '.gitignore' \
    -name 'Dockerfile*' \
    \) -delete && \
    rm -rf \
    TheiaIDE\ logo \
    configs \
    releng \
    cleanup \
    next \
    scripts \
    images \
    lerna.json \
    tsconfig.json \
    yarn.lock
```

### 3. **Optimize date-fns Usage** (Est. savings: 25-30 MB)

**Problem:** `date-fns` is 34 MB - likely entire library imported instead of specific functions.

**Solution:**
- Use `date-fns` ESM imports for tree-shaking
- Or switch to lighter alternatives like `dayjs` (2 KB)

### 4. **Remove Unused Build Artifacts** (Est. savings: 5-10 MB)

**Problem:** Build configuration files still present:
```
/home/theia/applications/browser/webpack.config.js
/home/theia/applications/browser/gen-webpack.*.js
/home/theia/applications/browser/tsconfig.json
```

**Solution:**
```dockerfile
RUN find applications -type f \( \
    -name 'webpack*.js' -o \
    -name 'tsconfig.json' -o \
    -name 'gen-*.js' \
    \) -delete
```

---

## 🎯 Medium-Term Optimizations (Additional 100-200 MB)

### 5. **Multi-Stage Build with Separate Production Install** (Est. savings: 100+ MB)

Instead of copying the entire build stage, create a clean production install:

```dockerfile
# Production dependency stage
FROM node:22-bullseye-slim AS prod-deps

WORKDIR /home/theia
COPY package.json yarn.lock ./
COPY applications/browser/package.json applications/browser/

# Install ONLY production dependencies
RUN yarn install --production --frozen-lockfile --network-timeout 600000

# Final stage
FROM node:22-bullseye-slim AS base-ide
# ... runtime libs ...
COPY --from=build-stage /home/theia/applications /home/theia/applications
COPY --from=build-stage /home/theia/plugins /home/theia/plugins
COPY --from=build-stage /home/theia/theia-extensions /home/theia/theia-extensions
COPY --from=prod-deps /home/theia/node_modules /home/theia/node_modules
```

### 6. **Use Smaller Base Image**

Consider `node:22-alpine` instead of `node:22-bullseye-slim`:
- Alpine: ~40 MB base
- Bullseye-slim: ~75 MB base
- Savings: ~35 MB

**Caveat:** May require additional native dependencies for node-pty and native modules.

### 7. **Audit Large Packages**

Review necessity of:
- `@theia/*` (126 MB) - core packages, but audit which ones are actually used
- `@babel/*` (16 MB) - is runtime babel needed?
- `@octokit/*` (11 MB) - GitHub integration, needed at runtime?
- `openai` (7.3 MB) - AI features, optional?
- `puppeteer-core` (5.8 MB) - should be build-time only

---

## 📝 Recommended Dockerfile Changes

See the updated Dockerfile structure below:

```dockerfile
# Build stage - unchanged
FROM node:22-bullseye AS build-stage
# ... build process ...

# Production dependencies ONLY
FROM node:22-bullseye-slim AS prod-deps
WORKDIR /home/theia
COPY --from=build-stage /home/theia/package.json /home/theia/yarn.lock ./
COPY --from=build-stage /home/theia/applications/browser/package.json applications/browser/
RUN yarn install --production --frozen-lockfile --ignore-scripts

# Final runtime stage
FROM node:22-bullseye-slim AS base-ide

RUN apt-get update \
    && apt-get install -y --no-install-recommends libsecret-1-0 libxkbfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/theia

# Copy ONLY runtime artifacts
COPY --from=build-stage /home/theia/applications/browser/lib applications/browser/lib
COPY --from=build-stage /home/theia/applications/browser/package.json applications/browser/
COPY --from=build-stage /home/theia/plugins plugins
COPY --from=build-stage /home/theia/theia-extensions/product/lib theia-extensions/product/lib
COPY --from=build-stage /home/theia/theia-extensions/product/package.json theia-extensions/product/

# Copy production node_modules
COPY --from=prod-deps /home/theia/node_modules node_modules

# Copy only essential config
COPY --from=build-stage /home/theia/package.json package.json
```

---

## 🧪 Testing the Optimizations

After implementing changes:

```bash
# Build optimized image
docker build --tag theia-ide-base:optimized -f images/base-ide/Dockerfile .

# Compare sizes
docker images | grep theia-ide-base

# Test that it still works
docker run --rm -p 3000:3000 theia-ide-base:optimized
```

---

## 📈 Expected Results

| Optimization | Current Size | Optimized Size | Savings |
|--------------|--------------|----------------|---------|
| Quick wins only | 999 MB | ~750 MB | 25% |
| Quick + Medium | 999 MB | ~500 MB | 50% |
| Aggressive | 999 MB | <400 MB | 60%+ |

---

## ⚠️ Risks & Considerations

1. **Production dependencies:** Ensure all runtime dependencies are in `dependencies`, not `devDependencies`
2. **Native modules:** Some packages may need build tools even at runtime (rare)
3. **Testing:** Thoroughly test the optimized image - some packages include runtime-required files in unexpected places
4. **Plugins:** Verify all Theia plugins still load correctly after cleanup

---

## 🚀 Priority Action Items

1. ✅ **IMMEDIATE:** Add production-only install in final stage (~150 MB saved)
2. ✅ **IMMEDIATE:** Remove obvious unnecessary files (~30 MB saved)
3. ⏰ **NEXT:** Audit and optimize large packages
4. ⏰ **FUTURE:** Consider Alpine base image

