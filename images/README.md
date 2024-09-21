# Artemis Theia IDE Images

We use Theia to provide students with programming environments tailored to their course`s needs. Instructors can choose a fitting Theia Blueprint (=Theia IDE Image) in Artemis. This repository contains the build tooling for creating those images.

Matching Artemis' programming environments, the following images are available:

| Name      | Available | Language & Auto-Complete |
|-----------|:---------:|:----------------:|
| Java 17   | ✔️         |         ✔️        |
| Kotlin    | ✔️         |         ✔️        |
| Python    | ✔️         |         ✔️        |
| C         | ✔️         |         ✔️        |
| Haskell   | ✔️         |        ❌        |
| VHDL      | ❌        |        ❌        |
| Assembler | ❌        |        ❌        |
| Swift     | ✔️         |        ✔️         |
| Ocaml     | ✔️         |        ✔️         |
| Javascript| ✔️         |        ✔️         |
| Rust      | ✔️         |        ✔️         |


## Structure of Images

Our used Theia IDE Images are built in 3 steps

1. The `ide-image` builds the Theia Application, downloads all essential plugins and performs cleanup.
2. The `plugin-image` downloads required plugins for each specific programming environment (e.g., linter plugins for Java)
3. The `tool-image` downloads and installs necessary compilers and tools for each programming environment and contains Node.js to launch Theia

## Building Dockerfiles for Images

1. Start with the `tool-image`
2. Copy the built Theia Application with plugins from the `ide-image`
3. Copy the downloaded plugins from the `plugin-image` (implemented in the ToolDockerfile)

## Creating Images

For overwriting default Theia configuration files, a simple directory can be created inside the image's location. Using a `COPY` instruction in the Dockerfile, all contents will overwrite existing files in the image.

For example, for the image `images/base-ide/`, there is a `package.json`. Using `COPY images/base-ide/ .` in the Dockerfile will replace the default `package.json` of Theia. Creating more files in sub-directories (`images/base-ide/test/test.json`) will also overwrite existing files recursively.

Similar to VSC, Theia IDE also supports to set configuration values using a `settings.json`. The `images/base-ide/project` folder will be mounted at `/home/project` inside the final image and, thus, will load the configuration values during startup.

## Choosing the correct plugins

Plugins are an easy way to add functionality to the basic features of VSC or the minimal `base-ide` image. To configure the download step of the `plugin-image` (currently incorporated in the `ToolDockerfile`), you may change the `theiaPlugins` array of the `package.json` inside of your image's folder (`/images/<name>/package.json`). Why don´t you start finding appropriate plugins [here](https://open-vsx.org/)?

### Configuring Theia's VSC built-ins

Theia offers a large built-in plugin bundling all those (82) functions and languages that VSC offers out of the box (https://open-vsx.org/api/eclipse-theia/builtin-extension-pack/1.88.1/file/eclipse-theia.builtin-extension-pack-1.88.1.vsix). As your image most likely will not require all those features, you can remove sub-plugins by adding their `id` to the list of `theiaPluginsExcludeIds` of the `package.json`. You can find the list of all excluded plugins in the `/images/base-ide/package.json`.

## Testing blueprints locally

To test images locally, they need to be pulled from ghcr.io. You can also built them yourself by starting with the BaseImage and follow with the respective ToolImage afterwards.

```
docker build -t ghcr.io/ls1intum/theia/base-ide -f images/base-ide/BaseDockerfile .

docker build -t ghcr.io/ls1intum/theia/java-17 -f images/java-17/ToolDockerfile .
```

When finally starting the container, remember that Theia utilizes port 3000. You may use the following command to start the Java17 image.

```
docker run --rm --name theia -p 3000:3000 ghcr.io/ls1intum/theia/java-17
```
