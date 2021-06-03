import os from 'os';
import path from 'path';


/**
 * Absolute path to the VS Code themes folder.
 */
export const EXTENSIONS_DIR = path.resolve(os.homedir(), '.vscode', 'extensions');


/**
 * Default directory relative to a project's root where VSCT will write compiled
 * extensions to.
 */
export const DEFAULT_OUT_DIR = '.vscode-extension';
