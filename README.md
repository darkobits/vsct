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

A tool for authoring VS Code themes in JavaScript.

## Prerequisites

You should have at least a working knowledge of the JavaScript programming
language and of how VS Code themes are authored. For more resources
on these topics, see [Additional Resources](#additional-resources) below.

This documentation also assumes you have sensibly recent versions of Node, NPM,
and VS Code installed on your system.

# Install

If starting a new project, you may use `npm init` to generate the necessary
files to get you started. Then, to install VSCT, run:

```
npm i @darkobits/vsct
```

# Use

VSCT consists of two components:

1. A framework for authoring themes in JavaScript/TypeScript.
2. A CLI, responsible for serializing themes to JSON and symlinking them into a
   local VS Code installation.

## Framework

VSCT aims to make theme authoring easier, more precise, and more reliable by
giving creators the ability to write themes using a modern programming language.
This allows creators to build large, complex themes leveraging the millions of
amazing packages in the NPM ecosystem.

For example, VSCT ships with the powerful [Color](https://github.com/Qix-/color#readme)
library, which lets authors work with colors in multiple color spaces,
manipulate color using a straightforward API, and minimize repetition and typos.

When it's time to publish your work, VSCT makes it easy to compile your
JavaScript-based themes to the JSON format that VS Code expects. You can then
publish to the Visual Studio Marketplace using a Microsoft Azure DevOps account
and VSCE, or publish directly to NPM. ✨

> **💡 Protip:** Using the VSCT framework to define your theme is completely
> optional. It is mostly syntactic sugar to improve readability and promote
> organization. As long as your default export is a `JSON.stringify`-able object
> that conforms to the VS Code theme spec, you're

### `ThemeFactory((theme: ThemeGenerator) => void): ThemeDefinition`

VSCT's default export is a function that accepts a callback that will be passed
a `ThemeGenerator` object containing various functions for programmatically
defining a VS Code theme. These functions are documented in more detail below.

The object returned by this function can be serialized into JSON using
`JSON.stringify`, which will produce a valid VS Code theme definition.

### `ThemeGenerator`

This section documents the API for the `ThemeGenerator` object passed to the
`ThemeFactory` callback function.

#### `tokenColors.add(value: GrammarDescriptor): void`

"Token Colors" are used to highlight a document in a VS Code editor pane.

This method accepts a `GrammarDescriptor` object (used for syntax-highlighting)
and adds the provided settings to the theme.

A `GrammarDescriptor` consists of an optional `name`, a list of `scopes`, and a
`settings` object specifying how to style syntax.

> **💡 Protip:** To help prevent errors, VSCT uses an object rather than a
> string for `settings.fontStyle`. This object may contain any combination of
> `bold`, `italic`, and `underline` properties that should map to boolean
> values.

> `theme.js`

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

This method is used to style the VS Code user interface. It method accepts a
`ColorSettings` object and adds the provided settings to the theme.

A `ColorSettings` object is a mapping of [VS Code theme color tokens](https://code.visualstudio.com/api/references/theme-color)
to either:

* a valid [color value](https://code.visualstudio.com/api/references/theme-color#color-formats)
  such as `#023BF3`
* a [`Color`](https://github.com/Qix-/color) instance

```js
import ThemeFactory, { Color } from '@darkobits/astra'

export default ThemeFactory(theme => {
  theme.colors.add({
    'editor.background': '#FF0000'
    'editor.foreground': new Color({r: 255, g: 0, b: 0})
  });
});
```

> **💡 Protip:** The `Color` export from VSCT is a wrapper for the excellent
> [`color`](https://github.com/Qix-/color) package with custom serialization
> added. Refer to the documentation for `color` to construct and manipulate
> colors, but always use the export from VSCT to ensure themes are serialized
> correctly.

#### `get(path: string): any`

Accepts a dot-delimited path and returns the value at that path in the theme
object.

**Example:**

```ts
import ThemeFactory from '@darkobits/vsct';

export default ThemeFactory(theme => {
  const activityBarBg = theme.get('colors.activityBar.background');
});
```

#### `set(path: string, value: any): void`

Provided a dot-delimited path and a value, sets the value at the path in the
theme object.

**Example:**

```ts
import ThemeFactory from '@darkobits/vsct';

export default ThemeFactory(theme => {
  theme.set('colors.tokenColors.0.settings.foreground', 'hotpink);
});
```

> **💡 Protip:** You'll need to use this method to set a theme's `label`. This
> is the value the user will see in the theme dropdown, and should be different
> for each theme your extension provides.

## CLI

This section documents the VSCT CLI, the principal functions of which are:

* Read a host package's VSCT configuration file.
* Transform JavaScript modules that export serializable `ThemeFactory` objects
  into JSON.
* Generate a spec-compliant VS Code extension manifest file.
* Create symbolic links from the VS Code extensions directory to the package's
  local output directory.

The VSCI CLI is intended to be used in a directory containing a `package.json`
file – or a subdirectory thereof. The directory containing this file is considered
the "root" directory of a project. A VSCT configuration file (typically
`vsct.config.js`) should be created in the root directory. This file is used by
the CLI to compile and install a package's themes.

### Configuration File

Below is an example VSCT configuration file with a description of each supported
option.

```js
module.exports = {
  /**
   * Unique identifier for the extension. This value will also be used as the
   * theme's display name (used in the Extensions pane, for example) if a
   * "displayName" is not set in the project's package.json.
   *
   * This field is optional. If omitted, VSCT will derive it using the "name"
   * field in package.json.
   */
  name: 'one-dark-pro',

  /**
   * Directory relative to this file where VSCT will write generated manifests
   * and themes to.
   *
   * This field is required.
   */
  outDir: 'themes',

  /**
   * Array of theme descriptor objects for each theme provided by the extension.
   * Each entry's "path" field should point to a require()-able JavaScript file
   * that can be interpreted by the system's current version of Node. The
   * module's default export should be the return value of `ThemeFactory`.
   */
  themes: [{ path: 'src/one-dark-pro.js' }]
};

```

### `compile`

This command will read the project's `package.json` and VSCT configuration file.
It will then compile each theme enumerated in the configuration file's `themes`
array, generate an extension manifest, and write each to `outDir`. This command
will also copy files like `LICENSE` and `README.md` if present. As a result,
`outDir` should be a valid, self-contained VS Code extension.

### `install`

This command will read the project's VSCT configuration file and then create a
symbolic link in the current user's VS Code extensions directory that points
to the configured `outDir`. Assuming the extension has been compiled, it will
be loaded the next time VS Code is opened or a VS Code window is reloaded.

### `start`

This command is designed for developing a VS Code theme with VSCT. It will
initially run the `install` command, and then watch theme source files and
continuously run `compile` as they change to keep the compiled extension in
`outDir` in sync.

> **💡 Protip:** Unfortunately, this command cannot reload a VS Code window for
> you when a theme's code changes, so you'll have to reload windows manually
> when you save a theme module in order to see any changes you've made.

# Additional Resources

* [VS Code Theme Color Guide](https://code.visualstudio.com/api/references/theme-color)
* [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
* [VS Code Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)

<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/118062198-4ff04e80-b34b-11eb-87f3-406a345d5526.png" style="max-width: 100%;">
</a>
