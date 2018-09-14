import os from 'os';
import path from 'path';


/**
 * Absolute path to the VS Code themes folder.
 */
export const EXTENSIONS_DIR = path.resolve(os.homedir(), '.vscode', 'extensions');
