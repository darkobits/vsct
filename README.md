<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/102319602-05031400-3f30-11eb-82e9-81afbc3ce384.png" style="max-width: 100%;">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/vsct"><img src="https://img.shields.io/npm/v/@darkobits/vsct.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/vsct/actions"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fdarkobits%2Fvsct%2Fbadge%3Fref%3Dmaster&style=flat-square&label=build&logo=none"></a>
  <!-- <a href="https://app.codecov.io/gh/darkobits/vsct/branch/master"><img src="https://img.shields.io/codecov/c/github/darkobits/vsct/master?style=flat-square&color=brightgreen"></a> -->
  <a href="https://depfu.com/github/darkobits/vsct"><img src="https://img.shields.io/depfu/darkobits/vsct?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/static/v1?label=commits&message=conventional&style=flat-square&color=398AFB"></a>
</p>

A tool for authoring VS Code themes in JavaScript and distributing them via NPM.

Not related to the [Visual Studio Command Table file format](https://docs.microsoft.com/en-us/visualstudio/extensibility/internals/visual-studio-command-table-dot-vsct-files?view=vs-2019).

## Prerequisites

You should have at least a working knowledge of the JavaScript programming language and of how VS Code
themes are authored. For more resources on these topics, see [Additional Resources](#additional-resources)
below.

This documentation also assumes you have sensibly recent versions of Node, NPM, and VS Code installed
on your system.

# Install

If starting a new project, you may use `npm init` to generate the necessary files to get you started.
Then, to install VSCT, run:

```
npm install --save-dev @darkobits/vsct
```

# Use

VSCT consists of two components:

1. A framework for authoring VS Code themes in JavaScript/TypeScript, the use of which is optional.
2. A CLI, responsible for compiling themes to JSON, installing themes, and providing a user-friendly
  development workflow.

## Framework

VSCT aims to make theme authoring easier, more precise, and more reliable by giving creators the ability
to write themes using a modern programming language. This allows creators to build large, complex themes
leveraging the millions of amazing packages in the NPM ecosystem.

For example, VSCT ships with the powerful [Color](https://github.com/Qix-/color#readme) library, which
lets authors work with colors in multiple color spaces, manipulate color using a straightforward API,
and minimize repetition and typos.

When it's time to publish your work, VSCT makes it easy to compile your JavaScript-based themes to the
JSON format that VS Code expects. You can then publish directly to NPM, and users can install your theme
using `npm install`. Alternatively, if you have a Microsoft Azure DevOps account, you may publish to the
Visual Studio Marketplace.

> **💡 Protip:** Using the VSCT framework to define your theme is completely optional. It is mostly
> syntactic sugar to improve readability and promote organization. As long as a theme's default export
> is a serializable object that conforms to the VS Code theme spec, you are free to use any tools you
> want.

### `ThemeFactory((theme: ThemeGenerator) => void): ThemeDefinition`

VSCT's default export is a function that accepts a callback that will be passed a `ThemeGenerator`
object containing various functions for programmatically defining a VS Code theme. These functions are
documented in more detail below.

The object returned by this function can be serialized into JSON using `JSON.stringify`, which will
produce a valid VS Code theme definition.

### `ThemeGenerator`

This section documents the API for the `ThemeGenerator` object passed to the `ThemeFactory` callback
function.

#### `tokenColors.add(value: GrammarDescriptor): void`

"Token Colors" are used to highlight a document in a VS Code editor pane.

This method accepts a `GrammarDescriptor` object (used for syntax-highlighting) and adds the provided
settings to the theme.

A `GrammarDescriptor` consists of an optional `name`, a list of `scopes`, and a `settings` object
specifying how to style syntax.

> **💡 Protip:** To help prevent errors, VSCT uses an object rather than a string for
> `settings.fontStyle`. This object may contain any combination of `bold`, `italic`, and `underline`
> properties that should map to boolean values.

**Example**

```js
import ThemeFactory from '@darkobits/astra'

export default ThemeFactory(theme => {
  theme.tokenColors.add({
    name: 'Variables',
    scope: [
      'meta.definition variable',
      'variable.other.readwrite',
      'entity.quasi variable.other'
    ],
    settings: {
      foreground: '#FF0000',
      fontStyle: {
        bold: true
      }
    }
  });
});
```

#### `colors.add(value: ColorSettings): void`

This method is used to style the VS Code user interface. This method accepts a `ColorSettings` object
and adds the provided settings to the theme.

A `ColorSettings` object is a mapping of [VS Code theme color tokens](https://code.visualstudio.com/api/references/theme-color)
to either:

* a valid [color value](https://code.visualstudio.com/api/references/theme-color#color-formats)
  such as `#023BF3`
* a [`Color`](https://github.com/Qix-/color) instance

**Example**

```js
import ThemeFactory, { Color } from '@darkobits/astra'

export default ThemeFactory(theme => {
  theme.colors.add({
    'editor.background': '#FF0000'
    'editor.foreground': new Color({r: 255, g: 0, b: 0})
  });
});
```

> **💡 Protip:** The `Color` export from VSCT is a wrapper for the excellent [`color`](https://github.com/Qix-/color)
> package with custom serialization added. Refer to the documentation for `color` to construct and
> manipulate colors, but always use the export from VSCT to ensure themes are serialized correctly.

#### `get(path: string): any`

Accepts a dot-delimited path and returns the value at that path in the theme object.

**Example:**

```ts
import ThemeFactory from '@darkobits/vsct';

export default ThemeFactory(theme => {
  const activityBarBg = theme.get('colors.activityBar.background');
});
```

#### `set(path: string, value: any): void`

Provided a dot-delimited path and a value, sets the value at the path in the theme object.

**Example:**

```ts
import ThemeFactory from '@darkobits/vsct';

export default ThemeFactory(theme => {
  theme.set('colors.tokenColors.0.settings.foreground', 'hotpink);
});
```

## CLI

This section documents the VSCT CLI, the principal functions of which are:

* Read a host package's VSCT configuration file.
* Transform JavaScript modules that export serializable objects into JSON.
* Generate a spec-compliant VS Code extension manifest file.
* Create symbolic links from the VS Code extensions directory to the package's local output directory.

The VSCT CLI is intended to be used in a directory containing a `package.json` file – or a subdirectory
thereof. The directory containing this file is considered the "root" directory of a project. A VSCT
configuration file, `vsct.config.js`, should be created in the root directory. This file is used to
provide information about your theme to the CLI.

### Configuration File

VSCT tries to infer most of the information it needs to generate a manifest for your extension (also
named `package.json`) from your project's `package.json`. However, where additional information is
needed, a VSCT configuration file, `vsct.config.js`, should be used.

Below is an example VSCT configuration file with a description of each supported option.

> `vsct.config.js`

```js
module.exports = {
  /**
   * Override VSCT's default package.json inference (using the de-scoped "name")
   * and provide an explicit value for the extension's "name". This is also the
   * name the extension will publish to on NPM, but will not be shown to users
   * in the VS Code interface.
   */
  name: 'one-dark-pro';

  /**
   * Override VSCT's default package.json inference (reading from "displayName")
   * and provide an explicit value for the extension's "displayName". This is
   * shown in the Extensions list and in the extensions detail screen.
   */
  displayName: 'One Dark Pro',

  /**
   * Override VSCT's default package.json inference (reading from "author") and
   * provide an explicit value for the extension's "publisher".
   */
  publisher: 'binaryify',

  /**
   * Directory relative to this file where VSCT will write compiled extensions.
   *
   * Default: .vsct-extension
   */
  outDir: 'themes',

  /**
   * Array of theme descriptor objects for each theme provided by the extension.
   * Each entry's "path" field should point to a require()-able JavaScript file
   * that can be interpreted by the system's current version of Node. The
   * module's default export should be the return value of `ThemeFactory` or an
   * object that can be serialized.
   *
   * Required.
   */
  themes: [{
    /**
     * Value that will appear in the "Select Color Theme" drop-down.
     *
     * Required.
     */
    label: 'One Dark Pro',

    /**
     * One of "vs-light" or "vs-dark".
     */
    uiTheme: 'vs-dark',

    /**
     * Path relative to this file where the entrypoint for the theme can be
     * found.
     */
    path: 'dist/one-dark-pro.js'
  }]
};

```

### `vsct compile`

This command will read the project's `package.json` and VSCT configuration file. It will then compile
each theme enumerated in the configuration file's `themes` array, generate an extension manifest, and
write each to `outDir`. This command will also copy files like `LICENSE` and `README.md` if present. As
a result, `outDir` should be a valid, self-contained VS Code extension.

### `vsct dev`

This command will create a symbolic symbolic link in the current user's VS Code extensions directory
that points to the configured `outDir`. Assuming the extension has been compiled, it will be loaded the
next time VS Code is opened or a VS Code window is reloaded.

### `vsct start`

This command is designed for developing a VS Code theme with VSCT. It will wait for files in `outDir` to
become present, then invoke `compile` and `dev` to install the local extension into VS Code. It will
then watch `outDir` and continuously re-compile the extension as theme source files are changed.

> **💡 Protip:** Unfortunately, this command cannot reload a VS Code window for you when a theme's code
> changes, so you'll have to reload windows manually when you make a change in order to see them
> reflected in the VS Code interface.

# Additional Resources

* [VS Code Extension Manifest Spec](https://code.visualstudio.com/api/references/extension-manifest)
* [VS Code Theme Color Guide](https://code.visualstudio.com/api/references/theme-color)
* [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
* [VS Code Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)

<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/118062198-4ff04e80-b34b-11eb-87f3-406a345d5526.png" style="max-width: 100%;">
</a>
