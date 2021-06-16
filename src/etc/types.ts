import { NormalizedPackageJson } from 'read-pkg-up';


/**
 * An object describing an individual theme in a VSCT configuration file.
 */
export interface ThemeDescriptor {
  /**
   * Path (relative to the theme manifest) to the theme file.
   */
  path: string;

  /**
   * Label to use for the theme. Appears in the theme selector drop-down.
   */
  label: string;

  /**
   * Base color set for the theme.
   */
  uiTheme: 'vs-light' | 'vs-dark';
}


/**
 * Shape of the object defined in a user's VSCT configuration file.
 */
export interface VSCTConfiguration {
  /**
   * Override VSCT's default package.json inference and provide an explicit
   * value for the extension's "name". This is also the name the extension will
   * publish to on NPM, but will not be shown to users in the VS Code interface.
   */
  name?: string;

  /**
   * Override VSCT's default package.json inference and provide an explicit
   * value for the extension's "displayName". This is shown in the Extensions
   * list and in the extensions detail screen.
   */
  displayName?: string;

  /**
   * Override VSCT's default package.json inference and provide an explicit
   * value for the extension's "publisher".
   */
  publisher?: string;

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
 * Optional configuration factory that may be used in a VSCT configuration file.
 */
export type VSCTConfigurationFactory = (opts: {
  json: NormalizedPackageJson;
  isDev: boolean;
}) => VSCTConfiguration;


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

  /**
   * Whether or not the handler function is being invoked as part of a
   * development-related process ("start", "dev").
   */
  isDev?: boolean;
}


export type CLIHandlerFn = (opts: CLIHandlerOptions) => void | Promise<void>;
