/**
 * ===== Install ===============================================================
 *
 * This module is the handler for the "vsct install" command, which should be
 * part of a consumer's "postinstall" NPM script. It is also run by the "vsct
 * start" command to symlink theme directories.
 */
import path from 'path';
import fs from 'fs-extra';
import {NormalizedPackageJson} from 'read-pkg-up';

import {EXTENSIONS_DIR} from 'etc/constants';
import {CLIHandlerOptions, ThemeDescriptor} from 'etc/types';
import log from 'lib/log';
import {toDirectoryName, parsePackageName} from 'lib/misc';


/**
 * Provided a theme's base directory name and the host package's package.json,
 * returns the directory name that should be used when creating symlinks in the
 * VS Code themes folder. Directories in the VS Code extensions folder should
 * follow the pattern "<author name>.<extension name>".
 */
export function generateVsCodeThemeDirectoryName(packageJson: NormalizedPackageJson, themeDescriptor: ThemeDescriptor): string {
  if (packageJson.author?.name) {
    return `${toDirectoryName(packageJson.author.name)}.${toDirectoryName(parsePackageName(packageJson.name).name)}`;
  }

  const packageScope = parsePackageName(packageJson.name).scope;

  if (packageScope) {
    return `${toDirectoryName(packageScope)}.${toDirectoryName(parsePackageName(packageJson.name).name)}`;
  }

  return toDirectoryName(packageJson.name);
}


/**
 * For each theme in the host package's theme output directory, creates a
 * symbolic link from the VS Code theme directory to the theme's local
 * directory. This assumes that "vsct compile" has been run first.
 */
export default async function install({args, root, config, json}: CLIHandlerOptions) {
  // Compute the absolute path to the host package's theme output directory.
  const absThemesSrcDir = path.resolve(root, config.outDir);

  if (!config.themes || config.themes.length === 0) {
    log.warn(log.prefix('install'), 'Configuration file did not define any themes.');
    return;
  }

  return Promise.all(config.themes.map(async themeDescriptor => {
    // Compute the absolute path to the theme's source folder.
    const absThemeSrcDir = path.resolve(absThemesSrcDir);

    // Compute the absolute path to the symlink we will create in the VS Code
    // themes folder.
    const absSymlinkPath = path.join(EXTENSIONS_DIR, generateVsCodeThemeDirectoryName(json, themeDescriptor));

    // Determine if a symlink already exists.
    const symlinkExists = await fs.pathExists(absSymlinkPath);

    if (symlinkExists) {
      const linkTarget = await fs.realpath(absSymlinkPath);

      if (linkTarget === absThemeSrcDir) {
        // This flag is only used internally by the "start" command to suppress
        // this notification on re-compilations.
        if (!args.silent) {
          log.info(log.prefix('install'), `Theme ${log.chalk.blue(themeDescriptor.label)} already installed; skipping.`);
        }

        return;
      }

      // If the link exists but points to another target, remove it.
      await fs.unlink(absSymlinkPath);
    }

    await fs.ensureSymlink(absThemeSrcDir, absSymlinkPath);
    log.verbose(log.prefix('install'), `Sym-linked ${log.chalk.green(absSymlinkPath)} => ${log.chalk.green(absThemeSrcDir)}.`);
    log.info(log.prefix('install'), `Theme ${log.chalk.blue(themeDescriptor.label)} installed.`);
  }));
}
