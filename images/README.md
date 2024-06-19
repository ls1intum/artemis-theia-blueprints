# Artemis Theia IDE Images

We use Theia to provide students with programming environments tailored to their course`s needs. Instructors can choose a fitting Theia Blueprint (=Theia IDE Image) in Artemis. This repository contains the build tooling for creating those images.

Matching Artemis' programming environments, the following images are available:
- [ ] Java 17-21
- [ ] Kotlin
- [ ] Python
- [ ] C
- [ ] Haskell
- [ ] VHDL
- [ ] Assembler
- [x] Swift
- [ ] Ocaml

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

