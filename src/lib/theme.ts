import {LooseObject, FormattingDescriptor} from 'etc/types';
import {merge} from 'lib/misc';


/**
 * Array of TextMate formatting descriptors for syntax highlighting.
 */
class ScopeDescriptorCollection extends Array<FormattingDescriptor> {
  /**
   * Adds the provided formatting descriptor to the theme's array of formatting
   * descriptors.
   */
  add(descriptor: FormattingDescriptor) {
    this.push(descriptor);
  }
}


/**
 * Object mapping VS Code color settings to color values.
 */
class ColorSettings {
  /**
   * Adds the provided color settings object to the theme's color settings.
   */
  add(colorSettings: LooseObject) {
    merge(this, colorSettings, true);
  }
}


/**
 * Shape of the theme object that theme generation functions should return, or
 * the shape of the object that may be passed directly to the Theme constructor.
 */
export interface ThemeDefinition {
  tokenColors: ScopeDescriptorCollection;
  colors: ColorSettings;
}


/**
 * Signature of the function provided to the Theme constructor.
 */
export type ThemeDefinitionFunction = (theme: ThemeDefinition) => void;


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
export default function ThemeFactory(themeDefinitionFn: ThemeDefinitionFunction): ThemeDefinition {
  const theme = {
    tokenColors: new ScopeDescriptorCollection(),
    colors: new ColorSettings()
  };

  themeDefinitionFn(theme);

  return theme;
}
