/**
 * ===== Misc Utilities ========================================================
 *
 * This module contains several various utility functions.
 */
import path from 'path';
import fs from 'fs-extra';


/**
 * Provided a string, returns a new string with all uppercase characters
 * lower-cased and all whitespace replaced with the '-' character.
 */
export function toDirectoryName(input: string): string {
  return input.replace(/[^\s\w.-]/g, '').replace(/\s/g, '-').toLowerCase();
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
 * Performs an in-place merge of the keys in object b into object a.
 */
export function merge<O extends {[index: string]: any}>(a: O, b: O, throwOnDuplicate = false): void {
  Object.keys(b).forEach(key => {
    if (throwOnDuplicate && Reflect.has(a, key)) {
      throw new Error(`Duplicate key: "${key}"`);
    }

    Reflect.set(a, key, b[key]);
  });
}


/**
 * Provided a valid NPM package name, returns an object containing its scope and
 * name parts.
 */
export function parsePackageName(fullName: string) {
  const match = /^(?:@(?<scope>.*)\/)?(?<name>.*)$/g.exec(fullName);

  if (!match) {
    throw new Error(`Unable to parse package name: "${fullName}".`);
  }

  const {groups} = match;

  if (!groups) {
    throw new Error(`Unable to parse package name: "${fullName}".`);
  }

  return {
    scope: groups.scope,
    name: groups.name
  };
}
