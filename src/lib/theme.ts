import Color from 'lib/color';
import {merge} from 'lib/misc';


/**
 * Object mapping VS Code color settings to color values. Colors may be string
 * literals or an instance of the VSCT Color helper class.
 */
interface ColorSettings {
  [index: string]: Color | string;
}


/**
 * Shape of the object describing a single TextMate formatting rule, which may
 * contain multiple scopes.
 */
export interface FormattingDescriptor {
  name?: string;
  scope: string | Array<string>;
  settings: {
    foreground?: Color | string;
    background?: Color | string;
    fontStyle?: string;
  };
}


/**
 * Shape of the theme object that theme generation functions should return, or
 * the shape of the object that may be passed directly to the Theme constructor.
 */
export interface ThemeDefinition {
  tokenColors: Array<FormattingDescriptor>;
  colors: ColorSettings;
}


/**
 * Shape of the object passed to ThemeGeneratorCallback.
 */
export interface ThemeGenerator {
  tokenColors: {
    /**
     * Adds the provided text formatting descriptor to the theme.
     */
    add(descriptor: FormattingDescriptor): void;
  };
  colors: {
    /**
     * Adds the provided color settings object to the theme's color settings.
     */
    add(colorSettings: ColorSettings): void;
  };
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
    tokenColors: [],
    colors: {}
  };

  themeGeneratorFn({
    tokenColors: {
      add(descriptor) {
        theme.tokenColors.push(descriptor);
      }
    },
    colors: {
      add(colorSettings) {
        merge(theme.colors, colorSettings, true);
      }
    }
  } as ThemeGenerator);

  return theme;
}
