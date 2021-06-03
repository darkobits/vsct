import { NormalizedPackageJson } from 'read-pkg-up';


/**
 * An object describing an individual theme in a VSCT configuration file.
 */
export interface ThemeDescriptor {
  /**
   * Path (relative to the theme manifest) to the theme file.
   */
  path: string;
}


/**
 * Shape of the object defined in a user's VSCT configuration file.
 */
export interface VSCTConfiguration {
  /**
   * String used for the "name" field in generated extension manifests. This
   * string must be unique across all installed themes to ensure proper
   * behavior. By default, VSCT will infer this value from the project's
   * package.json.
   */
  name?: string;

  /**
   * String used for the "displayName" field in generated extension manifests.
   * This string is shown in the Extensions list and in the extensions detail
   * screen. By default, VSCT will infer this value from the project's
   * package.json.
   */
  displayName?: string;

  /**
   * Directory relative to the project root to which VSCT will write compiled
   * extension files.
   *
   * Default: '.vsct-extension'
   */
  outDir?: string;

  /**
   * Array of themes provided by the extension.
   */
  themes: Array<ThemeDescriptor>;
}


/**
 * Standard options passed to CLI handlers.
 */
export interface CLIHandlerOptions {
  /**
   * Parsed command-line arguments.
   */
  args: any;

  /**
   * Path where the host package's VSCT configuration file was found.
   */
  root: string;

  /**
   * The host package's parsed configuration.
   */
  config: VSCTConfiguration;

  /**
   * The host package's parsed package.json.
   */
  json: NormalizedPackageJson;
}
