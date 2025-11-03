# Theia Base IDE Image

The Base IDE serves as the foundational image for creating language-specific Theia IDE variants. It provides a minimal, lightweight Theia application with essential core functionality, designed to be extended with language-specific tooling and plugins.

## Design Philosophy

- **Minimal**: Includes only universal development tools (Git, Markdown, JSON)
- **Lightweight**: Excludes language-specific built-ins to reduce image size
- **Reusable**: Built once, copied into multiple language-specific images
- **Extensible**: Clean foundation for adding language tooling

## Purpose

This image:
1. Compiles the Theia IDE application from source
2. Downloads and configures core VS Code built-in extensions
3. Provides a standardized base for language-specific images
4. Eliminates redundant Theia builds across variants

For the complete architecture and usage examples, see the [Images README](../README.md).

## Included VS Code Built-in Extensions

The Base IDE includes a curated subset of VS Code built-in extensions, sourced from Theia's [builtin-extension-pack](https://open-vsx.org/extension/eclipse-theia/builtin-extension-pack). Only universally useful extensions are included to maintain a lightweight base.

### Extension Selection Criteria

Extensions are included if they provide:
- **Universal functionality**: Useful across all programming languages (Git, Markdown, JSON)
- **Core IDE features**: Essential for basic development (diff, merge conflict resolution)
- **Low overhead**: Minimal impact on image size and startup time

### Complete Extension List

The following table shows all available built-in extensions and which are included in this base image:

| Package Name                              | Description | Included |
|----------------------------------------------|----------|:--------:|
| eclipse-theia.builtin-extension-pack         | Builtin extension pack associated to a version of vscode | ✔️ |
| ms-vscode.js-debug                           | An extension for debugging Node.js programs and Chrome. |    |
| ms-vscode.js-debug-companion                 | Companion extension to js-debug that provides capability for remote debugging |    |
| vscode.bat                                   | Provides snippets, syntax highlighting, bracket matching and folding in Windows batch files. |    |
| vscode.builtin-notebook-renderers            | Provides basic output renderers for notebooks |    |
| vscode.clojure                               | Provides syntax highlighting and bracket matching in Clojure files. |    |
| vscode.coffeescript                          | Provides snippets, syntax highlighting, bracket matching and folding in CoffeeScript files. |    |
| vscode.configuration-editing                 | Provides capabilities (advanced IntelliSense, auto-fixing) in configuration files like settings, launch, and extension recommendation files. |    |
| vscode.cpp                                   | Provides snippets, syntax highlighting, bracket matching and folding in C/C++ files. |    |
| vscode.csharp                                | Provides snippets, syntax highlighting, bracket matching and folding in C# files. |    |
| vscode.css                                   | Provides syntax highlighting and bracket matching for CSS, LESS and SCSS files. |    |
| vscode.css-language-features                 | Provides rich language support for CSS, LESS and SCSS files. |    |
| vscode.dart                                  | Provides syntax highlighting & bracket matching in Dart files. |    |
| vscode.debug-auto-launch                     | Helper for auto-attach feature when node-debug extensions are not active. |    |
| vscode.debug-server-ready                    | Open URI in browser if server under debugging is ready. |    |
| vscode.diff                                  | Provides syntax highlighting & bracket matching in Diff files. | ✔️ |
| vscode.docker                                | Provides syntax highlighting and bracket matching in Docker files. |    |
| vscode.emmet                                 | Emmet support for VS Code |    |
| vscode.extension-editing                     | Provides linting capabilities for authoring extensions. |    |
| vscode.fsharp                                | Provides snippets, syntax highlighting, bracket matching and folding in F# files. |    |
| vscode.git                                   | Git SCM Integration | ✔️ |
| vscode.git-base                              | Git static contributions and pickers. | ✔️ |
| vscode.github                                | GitHub features for VS Code |    |
| vscode.github-authentication                 | GitHub Authentication Provider |    |
| vscode.go                                    | Provides syntax highlighting and bracket matching in Go files. |    |
| vscode.groovy                                | Provides snippets, syntax highlighting and bracket matching in Groovy files. |    |
| vscode.grunt                                 | Extension to add Grunt capabilities to VS Code. |    |
| vscode.gulp                                  | Extension to add Gulp capabilities to VSCode. |    |
| vscode.handlebars                            | Provides syntax highlighting and bracket matching in Handlebars files. |    |
| vscode.hlsl                                  | Provides syntax highlighting and bracket matching in HLSL files. |    |
| vscode.html                                  | Provides syntax highlighting, bracket matching & snippets in HTML files. |    |
| vscode.html-language-features                | Provides rich language support for HTML and Handlebar files |    |
| vscode.ini                                   | Provides syntax highlighting and bracket matching in Ini files. |    |
| vscode.ipynb                                 | Provides basic support for opening and reading Jupyter's .ipynb notebook files |    |
| vscode.jake                                  | Extension to add Jake capabilities to VS Code. |    |
| vscode.java                                  | Provides snippets, syntax highlighting, bracket matching and folding in Java files. |    |
| vscode.javascript                            | Provides snippets, syntax highlighting, bracket matching and folding in JavaScript files. |   |
| vscode.json                                  | Provides syntax highlighting & bracket matching in JSON files. | ✔️ |
| vscode.json-language-features                | Provides rich language support for JSON files. | ✔️ |
| vscode.julia                                 | Provides syntax highlighting & bracket matching in Julia files. |    |
| vscode.less                                  | Provides syntax highlighting, bracket matching and folding in Less files. |    |
| vscode.log                                   | Provides syntax highlighting for files with .log extension. | ✔️ |
| vscode.lua                                   | Provides syntax highlighting and bracket matching in Lua files. |    |
| vscode.make                                  | Provides syntax highlighting and bracket matching in Make files. |    |
| vscode.markdown                              | Provides snippets and syntax highlighting for Markdown. | ✔️ |
| vscode.markdown-language-features            | Provides rich language support for Markdown. | ✔️ |
| vscode.markdown-math                         | Adds math support to Markdown in notebooks. |   |
| vscode.media-preview                         | Provides VS Code's built-in previews for images, audio, and video | ✔️ |
| vscode.merge-conflict                        | Highlighting and commands for inline merge conflicts. | ✔️ |
| vscode.npm                                   | Extension to add task support for npm scripts. |    |
| vscode.objective-c                           | Provides syntax highlighting and bracket matching in Objective-C files. |    |
| vscode.perl                                  | Provides syntax highlighting and bracket matching in Perl files. |    |
| vscode.php                                   | Provides syntax highlighting and bracket matching for PHP files. |    |
| vscode.php-language-features                 | Provides rich language support for PHP files. |    |
| vscode.powershell                            | Provides snippets, syntax highlighting, bracket matching and folding in Powershell files. |    |
| vscode.pug                                   | Provides syntax highlighting and bracket matching in Pug files. |    |
| vscode.python                                | Provides syntax highlighting, bracket matching and folding in Python files. |    |
| vscode.r                                     | Provides syntax highlighting and bracket matching in R files. |    |
| vscode.references-view                       | Reference Search results as separate, stable view in the sidebar |  ✔️ |
| vscode.restructuredtext                      | Provides syntax highlighting in reStructuredText files. |    |
| vscode.ruby                                  | Provides syntax highlighting and bracket matching in Ruby files. |    |
| vscode.rust                                  | Provides syntax highlighting and bracket matching in Rust files. |    |
| vscode.scss                                  | Provides syntax highlighting, bracket matching and folding in SCSS files. |    |
| vscode.search-result                         | Provides syntax highlighting and language features for tabbed search results. | ✔️ |
| vscode.shaderlab                             | Provides syntax highlighting and bracket matching in Shaderlab files. |    |
| vscode.shellscript                           | Provides syntax highlighting and bracket matching in Shell Script files. |    |
| vscode.simple-browser                        | A very basic built-in webview for displaying web content. |    |
| vscode.sql                                   | Provides syntax highlighting and bracket matching in SQL files. |    |
| vscode.swift                                 | Provides snippets, syntax highlighting and bracket matching in Swift files. |    |
| vscode.theme-abyss                           | Abyss theme for Visual Studio Code |    |
| vscode.theme-defaults                        | The default Visual Studio light and dark themes |    |
| vscode.theme-kimbie-dark                     | Kimbie dark theme for Visual Studio Code |    |
| vscode.theme-monokai                         | Monokai theme for Visual Studio Code |    |
| vscode.theme-monokai-dimmed                  | Monokai dimmed theme for Visual Studio Code |    |
| vscode.theme-quietlight                      | Quiet light theme for Visual Studio Code |    |
| vscode.theme-red                             | Red theme for Visual Studio Code |    |
| vscode.theme-solarized-dark                  | Solarized dark theme for Visual Studio Code |    |
| vscode.theme-solarized-light                 | Solarized light theme for Visual Studio Code |    |
| vscode.theme-tomorrow-night-blue             | Tomorrow night blue theme for Visual Studio Code |    |
| vscode.tunnel-forwarding                     | Allows forwarding local ports to be accessible over the internet. |    |
| vscode.typescript                            | Provides snippets, syntax highlighting, bracket matching and folding in TypeScript files. |    |
| vscode.typescript-language-features          | Provides rich language support for JavaScript and TypeScript. |    |
| vscode.vb                                    | Provides snippets, syntax highlighting, bracket matching and folding in Visual Basic files. |    |
| vscode.vscode-theme-seti                     | A file icon theme made out of the Seti UI file icons |    |
| vscode.xml                                   | Provides syntax highlighting and bracket matching in XML files. |  ✔️ |
| vscode.yaml                                  | Provides syntax highlighting and bracket matching in YAML files. |  ✔️ |

## Extending the Base Image

To create a language-specific image:

1. **Use multi-stage build**: Copy the Theia application from this base image
2. **Add language tools**: Install compilers, runtimes, and development tools
3. **Add plugins**: Include language-specific VS Code extensions
4. **Configure environment**: Set appropriate environment variables

Example:

```dockerfile
FROM ghcr.io/eclipse-theia/theia-ide/base AS base-ide

FROM node:22-bullseye-slim
RUN apt-get update && apt-get install -y python3 python3-pip
WORKDIR /home/theia
COPY --from=base-ide --chown=theia:theia /home/theia /home/theia
# ... rest of configuration
```

See the [Images README](../README.md) for complete examples and detailed documentation.
