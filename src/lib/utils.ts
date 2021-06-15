import { NormalizedPackageJson } from 'read-pkg-up';

import { VSCTConfiguration } from 'etc/types';
import log from 'lib/log';


/**
 * Common options object accepted by several utility functions.
 */
interface CommonOptions {
  config: VSCTConfiguration;
  json: NormalizedPackageJson;
}


/**
 * Provided a string, returns a new string with all uppercase characters
 * lower-cased and all whitespace replaced with the '-' character.
 */
export function toDirectoryName(input: string): string {
  return input.replace(/[^\s\w.-]/g, '').replace(/\s/g, '-').toLowerCase();
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
export function computeExtensionName({ config, json }: CommonOptions) {
  if (config.name) {
    return config?.name;
  }

  if (json.name) {
    return parsePackageName(json.name).name;
  }

  throw new Error('Unable to determine theme\'s name.');
}


/**
 * Determines the string to use as the theme's display name by inspecting the
 * host package's VSCT configuration and its package.json.
 */
export function computeExtensionDisplayName({ config, json }: CommonOptions) {
  if (config.displayName) {
    return config.displayName;
  }

  if (json?.displayName) {
    return json.displayName;
  }

  // If a "displayName" was not set in configuration or package.json, fall back
  // to using the extension's base name.
  const name = computeExtensionName({ config, json });

  if (name) {
    log.warn(`Could not find a ${log.chalk.bold('displayName')} in a configuration file or package.json; falling-back to base name ${log.chalk.blue.bold(name)}.`);
    return name;
  }

  throw new Error('Unable to determine theme\'s display name.');
}


/**
 * Computes the extension's author by first trying to use the "author.name"
 * path in package.json. If this is not set, the scope from the "name" field
 * will be used instead.
 */
export function computeExtensionAuthor({ json }: CommonOptions) {
  if (json.author?.name) {
    return json.author.name;
  }

  const { scope } = parsePackageName(json.name);

  if (scope) {
    return scope;
  }


  throw new Error('Unable to determine theme\'s author.');
}
