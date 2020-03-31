/**
 * An object of unknown shape.
 */
export interface LooseObject {
  [index: string]: any;
}


/**
 * An object describing an individual theme in a .vsctrc file.
 */
export interface ThemeDescriptor {
  type?: 'precompiled' | 'uncompiled';
  label: string;
  main: string;
  uiTheme?: string;
}


/**
 * Shape of the object defined in a user's .vsctrc file.
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
  json: LooseObject;
}
