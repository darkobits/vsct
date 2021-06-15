import dotProp from 'dot-prop';
import * as R from 'ramda';

import Color from 'lib/color';
import { merge } from 'lib/utils';


/**
 * Shape of the object describing a single TextMate formatting rule, which may
 * contain multiple scopes.
 */
export interface GrammarDescriptor {
  // [index: string]: any;
  name?: string;
  scope: string | Array<string>;
  settings: {
    foreground?: Color | string;
    background?: Color | string;
    fontStyle?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
    };
  };
}


/**
 * Shape of final grammar descriptor objects as they will appear in compiled
 * themes.
 */
export interface TransformedGrammarDescriptor {
  name?: string;
  scope: string | Array<string>;
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?: string;
  };
}


/**
 * Object mapping VS Code color settings to color values. Colors may be string
 * literals or an instance of the VSCT Color helper class.
 */
export interface ColorSettings {
  [index: string]: Color | string;
}


/**
 * Shape of the theme object that theme generation functions should return, or
 * the shape of the object that may be passed directly to the Theme constructor.
 */
export interface ThemeDefinition {
  [key: string]: any;
  tokenColors: Array<TransformedGrammarDescriptor>;
  colors: ColorSettings;
}


/**
 * Shape of the object passed to ThemeGeneratorCallback functions.
 */
export interface ThemeGenerator {
  tokenColors: {
    /**
     * Adds the provided text formatting descriptor to the theme.
     */
    add(descriptor: GrammarDescriptor): void;
  };
  colors: {
    /**
     * Adds the provided color settings object to the theme's color settings.
     */
    add(colorSettings: ColorSettings): void;
  };

  /**
   * Use dot-prop to get an arbitrary value from the theme definition.
   */
  get: (path: string) => any;

  /**
   * Use dot-prop to set an arbitrary value in the theme definition.
   */
  set: (path: string, value: any) => void;
}


/**
 * Signature of the user-provided callback to ThemeFactory.
 */
export type ThemeGenerationCallback = (themeGenerator: ThemeGenerator) => void;


/**
 * Provides a concise, declarative, type-safe way to define themes. It is not
 * necessary to define themes using this helper as long as the object exported
 * exported by a module can be serialized into a valid theme file.
 *
 * @example
 *
 * ```ts
 * import ThemeFactory from '@darkobits/vsct';
 *
 * export default ThemeFactory(theme => {
 *   // Use TextMate formatting rules for syntax highlighting.
 *   theme.tokenColors.add({
 *     scope: [...],
 *     settings: {...}
 *   });
 *
 *   // Use VS Code style tokens to set UI colors.
 *   theme.colors.add({
 *     'editor.foreground': '#FAFAFA'
 *   });
 * });
 * ```
 *
 * Related:
 * - https://github.com/Microsoft/vscode/tree/master/src/vs/workbench/services/themes/common/colorThemeSchema.ts
 */
export default function ThemeFactory(themeGeneratorFn: ThemeGenerationCallback): ThemeDefinition {
  const theme: ThemeDefinition = {
    label: '',
    uiTheme: 'vs-dark',
    tokenColors: [],
    colors: {}
  };

  themeGeneratorFn({
    tokenColors: {
      add: descriptor => {
        theme.tokenColors.push(R.evolve({
          settings: {
            /**
             * These two transformers are here mostly to make TypeScript happy;
             * Color instances would otherwise be serialized at theme
             * compile-time.
             */
            foreground: value => value.toString(),
            background: value => value.toString(),

            /**
             * Transforms a fontStyle object into a space-delimited string of
             * 'bold', 'italic', and/or 'underline' keywords as required by
             * the TextMate spec.
             *
             * @example
             *
             * {
             *   bold: true,
             *   italic: true
             * } => 'bold italic'
             */
            fontStyle: (value: GrammarDescriptor['settings']['fontStyle']) => {
              if (!value) {
                return;
              }

              return R.join(' ', R.reduce((fontStylesArr, [fontStyleName, fontStyleValue]) => {
                return fontStyleValue ? [...fontStylesArr, fontStyleName] : fontStylesArr;
              }, [] as Array<string>, R.toPairs(value)));
            }
          }
        }, descriptor));
      }
    },
    colors: {
      add: colorSettings => {
        merge(theme.colors, colorSettings, true);
      }
    },
    get: path => dotProp.get(theme, path),
    set: (path, value) => {
      dotProp.set(theme, path, value);
    }
  } as ThemeGenerator);

  return theme;
}
