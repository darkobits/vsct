/**
 * ===== Misc Utilities ========================================================
 *
 * This module contains several various utility functions.
 */
import path from 'path';
import importUnique from '@darkobits/import-unique';
import execa from 'execa';
import fs from 'fs-extra';
import traverse from 'traverse';
import {LooseObject} from 'etc/types';


/**
 * Provided a path to a theme module, loads and validates the module.
 */
export async function loadThemeFromModule(absModulePath: string): Promise<any> {
  await fs.access(absModulePath);

  // Load/parse the indicated theme file.
  const module = importUnique(absModulePath);
  const theme = module.default ? module.default : module;

  // Scrub theme for circular references and functions.
  traverse(theme).forEach(function (node) {
    if (this.circular) {
      throw new Error('Theme contains circular references.');
    }

    if (typeof node === 'function') {
      throw new Error('Theme contains non-serializable entities.');
    }
  });

  // If there is anything else that the theme exported that's not valid JSON,
  // this will throw.
  JSON.stringify(theme);

  return theme;
}


/**
 * Provided a raw theme label from a theme descriptor object, performs token
 * replacement and returns the parsed theme label.
 */
export function parseThemeLabel(rawLabel: string, json: any): string {
  const tokens = {
    '${version}': json.version // tslint:disable-line no-invalid-template-strings
  };

  return Object.entries(tokens).reduce((label, [token, replacement]) => {
    return label.replace(token, replacement);
  }, rawLabel);
}


/**
 * Provided a parsed theme label, returns a directory name that will be used to
 * contain the theme's JSON and manifest in the host's output directory.
 */
export function generateThemeDirName(themeLabel: string): string {
  return themeLabel.replace(/[^\w\s.-]/g, '').replace(/\s/g, '-').toLowerCase();
}


/**
 * Provided a base directory, returns an array of all immediate children that
 * are directories.
 */
export async function getImmediateSubfolders(rootDir: string) {
  const isDirectory = async (pathStr: string) => (await fs.lstat(pathStr)).isDirectory();

  const results = [];
  const children = await fs.readdir(rootDir);

  for (const child of children) {
    const isDir = await isDirectory(path.join(rootDir, child));

    if (isDir) {
      results.push(child);
    }
  }

  return results;
}


/**
 * Returns a copy of the provided array with any duplicate items removed.
 */
export function uniq(arr: Array<any>): Array<any> {
  const results: Array<any> = [];

  arr.forEach(item => {
    if (!results.includes(item)) {
      results.push(item);
    }
  });

  return results;
}


/**
 * Clears all data from the Node require cache.
 */
export function clearRequireCache() {
  Object.keys(require.cache).forEach(key => {
    Reflect.deleteProperty(require.cache, key);
  });
}


/**
 * Returns the version of VS Code currently installed on the system.
 */
export async function getVsCodeVersion() {
  const result = await execa('code', ['--version']);
  return result.stdout.split('\n')[0];
}


/**
 * Performs an in-place merge of the keys in object b into object a.
 */
export function merge(a: LooseObject, b: LooseObject, throwOnDuplicate = false): void {
  Object.keys(b).forEach(key => {
    if (throwOnDuplicate && Reflect.has(a, key)) {
      throw new Error(`Duplicate key: "${key}"`);
    }

    Reflect.set(a, key, b[key]);
  });
}


/**
 * Strips the scope from the provided package name, if it has one.
 *
 * @example
 *
 * getUnscopedName('@foo/bar') => 'bar'
 * getUnscopedName('bar') => 'bar'
 */
export function getUnscopedName(fullName: string): string {
  return fullName.split('/').slice(-1)[0];
}
