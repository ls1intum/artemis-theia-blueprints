# AGENTS.md — Artemis Theia Blueprints

Guide for AI agents working in this repository. Read this before making changes.

---

## What this repo does

Builds and publishes language-specific [Eclipse Theia](https://theia-ide.org/) IDE Docker images for the [Artemis](https://github.com/ls1intum/Artemis) online learning platform. Students open a browser-based IDE pre-configured for their course's programming language (Java, Python, C, Haskell, OCaml, Rust, Swift, JavaScript).

Images are published to `ghcr.io/ls1intum/theia/<language>` (e.g. `ghcr.io/ls1intum/theia/java-17`).

---

## Repository layout

```
images/
  base-ide/          # Builds Theia from source → the shared foundation
    BaseDockerfile   # Multi-stage build (install-deps → build-stage → prod-deps → base-ide)
    package.json.patch
    project/.vscode/settings.json
  <lang>/            # One dir per language: c, haskell, java-17, javascript, ocaml, python, rust, swift
    ToolDockerfile   # Extends base-ide; installs compiler + language plugins
    package.json.patch
    project/.vscode/settings.json

applications/browser/   # Browser target for Theia (what gets compiled into the base image)
theia-extensions/
  product/             # Branding extension (included in all builds)
  launcher/            # Electron-only — stripped during Docker builds
  updater/             # Electron-only — stripped during Docker builds
scripts/               # TypeScript utility scripts (run via yarn)
.github/workflows/
  build.yml            # Main CI: builds and pushes all images to GHCR
  scorpio_auto_update.yml  # Auto-bumps Artemis Scorpio plugin version
docker-compose.images.yml  # Local dev: builds all images together
```

---

## Image architecture

### Two-tier build

```
base-ide (BaseDockerfile)
  └─ Compiles Theia from source, downloads core plugins, produces slim runtime layer

<lang> (ToolDockerfile)  — one per language
  ├─ Copies built Theia from base-ide
  ├─ Installs language compiler/runtime (apt)
  └─ Downloads language-specific VS Code extensions (Open VSX)
```

### ToolDockerfile internal stages (run in parallel)
- `base-ide` — imports the pre-built Theia layer
- `apt-deps` — installs system packages (gcc, JDK, Python, etc.)
- `plugin-image` — downloads language-specific plugins via `yarn download:plugins`
- `final-ide` — assembles everything, sets up user `theia` (uid 101)

### Plugin configuration
Plugins are declared in `package.json` (`theiaPlugins` / `theiaPluginsExcludeIds`). Each language image has a `package.json.patch` that is deep-merged on top of the root `package.json` using a Node.js merge script inside the Dockerfile. Only override what changes — do not duplicate the full file.

---

## Project settings (`.vscode/settings.json`)

Each `images/<lang>/project/.vscode/settings.json` is copied to `/home/project/.vscode/settings.json` inside the container and loaded by Theia on startup. Theia reads project settings from `.vscode/settings.json` (not `.theia/settings.json`).

All images share a base set:
```json
{
  "extensions.ignoreRecommendations": true,
  "files.exclude": { "**/.theia": true, "persisted": true, "lost+found": true },
  "telemetry.telemetryLevel": false
}
```
Language images may add language-specific keys on top of this.

---

## Local development

### Build a single image pair
```sh
# 1. Build the base (required first)
docker build -t theia-base:local -f images/base-ide/BaseDockerfile .

# 2. Build a language image against the local base
docker build -t theia-java-17:local \
  --build-arg BASE_IMAGE=theia-base:local \
  -f images/java-17/ToolDockerfile .

# 3. Run it
docker run --rm -p 3000:3000 theia-java-17:local
# → open http://localhost:3000
```

### Build everything with Compose
```sh
docker compose -f docker-compose.images.yml build
docker compose -f docker-compose.images.yml up java-17   # port 3003
```

The compose file uses `additional_contexts: base-ide: "service:base-ide"` so language images automatically consume the locally-built base service rather than pulling from the registry.

Port mapping: base-ide → 3000, c → 3001, haskell → 3002, java-17 → 3003, javascript → 3004, ocaml → 3005, python → 3006, rust → 3007, swift → 3008.

---

## CI/CD

Workflow: [.github/workflows/build.yml](.github/workflows/build.yml)

| Trigger | Tags applied |
|---------|-------------|
| Pull request | `pr-<number>`, `pr-<number>-<sha>` |
| Push to master | `latest`, `latest-<sha>` |
| Release published | `<version>`, `<version>-<sha>` |

**Job order:**
1. `determine-tag` — computes Docker tags
2. `build-and-push-base` — builds `ls1intum/theia/base` (amd64 always, arm64 on non-PR)
3. `build-and-push` — builds all 8 language images in parallel, passing `BASE_IDE_TAG`

Note: `swift` is defined in `docker-compose.images.yml` but **not** in the CI matrix — it is not automatically published.

---

## Adding a new language image

1. Create `images/<lang>/` with:
   - `ToolDockerfile` — copy an existing one (e.g. `c/ToolDockerfile`) as a template
   - `package.json.patch` — only the plugin overrides needed
   - `project/.vscode/settings.json` — at minimum the base settings block above
2. Add the service to `docker-compose.images.yml` (follow the existing pattern with `additional_contexts`)
3. Add a matrix entry to `.github/workflows/build.yml` under `build-and-push`

---

## Key conventions

- **Theia version** is set in the root `package.json` and all `@theia/*` packages must stay in sync. Use `yarn update:theia <version>` to bulk-update.
- **Node.js** v22-bullseye in build stages, slim variant in runtime stages.
- **Yarn** v1 (classic) with `--frozen-lockfile` for reproducible installs.
- **User inside containers** is `theia` (uid 101); files under `/home/project` are owned by this user.
- **Electron-specific code** (`theia-extensions/launcher`, `theia-extensions/updater`, `applications/electron`) is deleted before the build step in `BaseDockerfile` — do not add Docker-relevant logic there.
- **Plugin downloads** happen inside the Dockerfile (not pre-committed); `yarn download:plugins` reads `theiaPlugins` from `package.json`.
- **Scorpio** is the Artemis integration plugin; its version lives in `images/base-ide/package.json` and is auto-bumped by the `scorpio_auto_update` workflow.

---

## Useful scripts

| Command | What it does |
|---------|-------------|
| `yarn update:theia <version>` | Updates all `@theia/*` deps to the given version |
| `yarn permissions:writeable` | Fixes plugin file permissions (called inside Dockerfiles) |
| `yarn browser build` | Compiles the browser Theia app |
| `yarn build:extensions` | Compiles custom Theia extensions |
| `yarn download:plugins` | Downloads plugins declared in `package.json` |
