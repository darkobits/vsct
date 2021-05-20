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
   * Optional filename to use for the compiled theme JSON file.
   *
   * Default: <theme base name>-<index in themes config array>
   */
  outputFilename?: string;

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
  /**
   * Optional directory name to use in the VS Code extensions directory.
   *
   * Default: <author>.<name>
   */
  installDir?: string;
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
