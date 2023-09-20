import { VSCTConfiguration } from 'etc/types';
import log from 'lib/log';

import type { NormalizedPackageJson } from 'read-pkg-up';


/**
 * Common options object accepted by several utility functions.
 */
interface CommonOptions {
  config: VSCTConfiguration;
  json: NormalizedPackageJson;
  isDev: boolean | undefined;
}


/**
 * Provided a string, returns a new string with all uppercase characters
 * lower-cased and all whitespace replaced with the '-' character.
 */
export function toDirectoryName(input: string): string {
  return input.replaceAll(/[^\s\w.-]/g, '').replaceAll(/\s/g, '-').toLowerCase();
}


/**
 * @deprecated
 *
 * Clears all data from the Node require cache.
 */
export function clearRequireCache() {
  if (!require?.cache) return;

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
 * @private
 *
 * Provided a valid NPM package name, returns an object containing its scope and
 * name parts.
 */
function parsePackageName(fullName: string) {
  const match = /^(?:@(?<scope>.*)\/)?(?<name>.*)$/g.exec(fullName);

  if (!match) {
    throw new Error(`Unable to parse package name: "${fullName}".`);
  }

  const { groups } = match;

  if (!groups) {
    throw new Error(`Unable to parse package name: "${fullName}".`);
  }

  return {
    scope: groups.scope,
    name: groups.name
  };
}


/**
 * Determines the string to use as the theme's name by inspecting the host
 * package's VSCT configuration and its package.json.
 */
export function computeExtensionName({ config, json, isDev }: CommonOptions) {
  let name;

  if (config.name) {
    name = config.name;
  } else if (json.name) {
    name = parsePackageName(json.name).name;
  } else {
    throw new Error('Unable to compute extension name.');
  }

  if (isDev) {
    name = `${name}-dev`;
  }

  return name;
}


/**
 * Determines the string to use as the theme's display name by inspecting the
 * host package's VSCT configuration and its package.json.
 */
export function computeExtensionDisplayName({ config, json, isDev }: CommonOptions) {
  let name = '';

  if (config.displayName) {
    name = config.displayName;
  } else if (json?.displayName) {
    name = json.displayName;
  } else {
    // If a "displayName" was not set in configuration or package.json, fall back
    // to using the extension's base name.
    name = computeExtensionName({ config, json, isDev: false })
    log.warn(`Could not find a ${log.chalk.bold('displayName')} in a configuration file or package.json; falling-back to base name ${log.chalk.blue.bold(name)}.`);
  }

  if (isDev) {
    name = `${name} (Dev)`;
  }

  return name;
}


/**
 * Computes the extension's "publisher" (equivalent to NPM's "author") by first
 * trying to use the "name" property in a VSCT configuration file. Then, it will
 * try the "author.name" path in package.json. If this is not set, the scope
 * from the "name" field will be used instead.
 */
export function computeExtensionPublisher({ config, json }: CommonOptions) {
  if (config.publisher) {
    return config.publisher;
  }

  if (json.author?.name) {
    return json.author.name;
  }

  const { scope } = parsePackageName(json.name);

  if (scope) {
    return scope;
  }

  throw new Error('Unable to determine theme\'s "publisher".');
}
