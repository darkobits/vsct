/**
 * ===== Package Introspection =================================================
 *
 * This module provides functions for introspecting the local package and the
 * user's package.
 */
import path from 'path';
import readPkgUp from 'read-pkg-up';


/**
 * Returns the normalized package.json and the package root directory, searching
 * upwards from the provided directory. If no directory is provided,
 * process.cwd() is used.
 */
export default async function pkgInfo(cwd?: string) {
  const results = await readPkgUp({cwd});

  return {
    root: path.parse(results.path).dir,
    json: results.pkg
  };
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
