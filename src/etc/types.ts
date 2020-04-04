import {NormalizedPackageJson} from 'read-pkg-up';


/**
 * An object describing an individual theme in a VSCT configuration file.
 */
export interface ThemeDescriptor {
  /**
   * Label that will be used for the theme in the VS Code theme chooser.
   */
  label: string;

  /**
   * Path (relative to the theme manifest) to the theme file.
   */
  path: string;

  /**
   * Controls the base colors used. Most themes will manually override many of
   * these.
   */
  uiTheme?: 'vs-light' | 'vs-dark';
}


/**
 * Shape of the object defined in a user's VSCT configuration file.
 */
export interface VSCTConfiguration {
  outDir: string;
  themes: Array<ThemeDescriptor>;
}


/**
 * Standard options passed to CLI handlers.
 */
export interface CLIHandlerOptions {
  args: any;
  root: string;
  config: VSCTConfiguration;
  json: NormalizedPackageJson;
}


/**
 * Shape of the object describing a single TextMate formatting rule, which may
 * contain multiple scopes.
 */
export interface FormattingDescriptor {
  name?: string;
  scope: string | Array<string>;
  settings: {
    [index: string]: string;
  };
}
