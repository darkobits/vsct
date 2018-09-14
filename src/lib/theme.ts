/**
 * ===== Theme Generator =======================================================
 *
 * Provides users with a concise, semantic, type-safe way to define themes.
 *
 * @example
 *
 * import Theme from '@darkobits/vsct';
 *
 * export default new Theme(t => {
 *   t.tokenColors.add({
 *     settings: {...},
 *     scope: [...]
 *   });
 *
 *   t.colors.add({
 *     'editor.foreground': '#FAFAFA'
 *   });
 * });
 *
 * Related:
 * - https://github.com/Microsoft/vscode/tree/master/src/vs/workbench/services/themes/common/colorThemeSchema.ts
 */
import {LooseObject} from '../etc/types';
import {merge} from 'lib/misc';


/**
 * Shape of the object describing a single TextMate formatting rule, which may
 * contain multiple scopes.
 */
export interface FormattingDescriptor {
  name?: string;
  settings: LooseObject;
  scope: string | Array<string>;
}


/**
 * An array of formatting descriptors with an "add" method for consistency.
 */
class ScopeDescriptorCollection extends Array<FormattingDescriptor> {
  add(descriptor: FormattingDescriptor) {
    this.push(descriptor);
  }
}


/**
 * VS Code GUI color settings are just a plain object. An "add" method has been
 * added for consistency.
 */
class ColorSettings extends Object {
  add(colorSettings: LooseObject) {
    merge(this, colorSettings, true);
  }
}


/**
 * Shape of the theme object that theme generation functions should return or,
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


export default class ThemeGenerator implements ThemeDefinition {
  tokenColors = new ScopeDescriptorCollection();
  colors = new ColorSettings();

  constructor(themeOrThemeFn: ThemeDefinition | ThemeDefinitionFunction) {
    if (typeof themeOrThemeFn === 'function') {
      themeOrThemeFn(this);
    } else {
      merge(this, themeOrThemeFn);
    }
  }
}
