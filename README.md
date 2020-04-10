<a href="#top" id="top">
  <h1 color="#FFFFFF" align="center">vsct</h1>
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/vsct"><img src="https://img.shields.io/npm/v/@darkobits/vsct.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/darkobits/vsct"><img src="https://img.shields.io/travis/darkobits/vsct.svg?style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/vsct"><img src="https://img.shields.io/codacy/coverage/43d139dd28af46aaaba1bbb76225f1ce.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square"></a>
</p>

A tool for creating VS Code themes.

## Install

```
npm i @darkobits/vsct
```

## Use

VSCT consists of a CLI and a lightweight framework to aid in theme authoring.
This documentation assumes the reader has a basic understanding of and
competence with the JavaScript programming language, the NPM package registry,
and how VS Code themes are typically authored.

### Framework

VSCT aims to make theme authoring easier by giving authors the ability to write
themes in code, using JavaScript (or TypeScript). This allows authors to create
complex themes that can be built using the millions of awesome packages
available in the JavaScript ecosystem.

Themes built with VSCT are JavaScript objects that serialize to JSON, the format
required by VS Code. If using TypeScript, VSCT's type definitions can help
ensure your themes are error-free. ✨

> **💡 Protip:** Types used in the following section are defined in
> [`theme.ts`](/src/lib/theme.ts).

#### `ThemeFactory((theme: ThemeGenerator) => void): ThemeDefinition`

VSCT's default export is a function that accepts a callback that will be passed
a `ThemeGenerator` object. This object provides a semantic way to
programmatically generate themes. Specifically, it contains a `tokenColors.add`
method for specifying a theme's syntax highlighting rules and a `colors.add`
method for specifying a theme's UI colors. The object returned it returns can be
serialized using `JSON.stringify` to produce a valid VS Code theme definition.

#### `ThemeGenerator`

This section documents the API for the `ThemeGenerator` object passed to the
function supplied to `ThemeFactory`.

##### `tokenColors.add(value: GrammarDescriptor): void`

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

##### `colors.add(value: ColorSettings): void`

This method accepts a `ColorSettings` object and adds the provided settings to
the theme.

A `ColorSettings` object is a mapping of [VS Code theme color tokens](https://code.visualstudio.com/api/references/theme-color) to either:

* a valid [color value](https://code.visualstudio.com/api/references/theme-color#color-formats)
  such as `#023BF3`
* a [`Color`](https://github.com/Qix-/color) instance

```js
import ThemeFactory, {Color} from '@darkobits/astra'

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


...

**Example:**

```ts
import ThemeFactory from '@darkobits/vsct';

export default ThemeFactory(theme => {
  theme.tokenColors.add
});
```

### CLI


### Additional Resources

* [VS Code Theme Color Guide](https://code.visualstudio.com/api/references/theme-color)
* [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
* [VS Code Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
