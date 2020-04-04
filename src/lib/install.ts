/**
 * ===== Install ===============================================================
 *
 * This module is the handler for the "vsct install" command, which should be
 * part of a consumer's "postinstall" NPM script. It is also run by the "vsct
 * start" command to symlink theme directories.
 */
import path from 'path';
import fs from 'fs-extra';
import {EXTENSIONS_DIR} from 'etc/constants';
import {CLIHandlerOptions} from 'etc/types';
import log from 'lib/log';

import {generateThemeDirName} from 'lib/misc';


/**
 * Provided a theme's base directory name and the host package's package.json,
 * returns the directory name that should be used when creating symlinks in the
 * VS Code themes folder.
 */
export function generateVsCodeThemeDirectoryName(json: CLIHandlerOptions['json'], themeDirName: string): string {
  return `${json.author?.name?.toLowerCase()}.${themeDirName.toLowerCase()}`;
}


/**
 * For each theme in the host package's theme output directory, creates a
 * symbolic link from the VS Code theme directory to the theme's local
 * directory. This assumes that "vsct compile" has been run first.
 */
export default async function install({args, root, config, json}: CLIHandlerOptions) {
  // Compute the absolute path to the output directory.
  const absThemesDir = path.resolve(root, config.outDir);

  if (!config.themes || config.themes.length === 0) {
    log.warn(log.prefix('install'), 'Configuration file did not define any themes.');
    return;
  }

  return Promise.all(config.themes.map(async themeDescriptor => {
    // Generate a sub-folder name to use for the theme.
    const themeDirName = generateThemeDirName(themeDescriptor.label);

    // Compute the absolute path to the theme's output folder.
    const absThemeOutDir = path.resolve(absThemesDir, themeDirName);

    // Compute the absolute path to the symlink we will create in the VS Code
    // themes folder.
    const absSymlinkPath = path.join(EXTENSIONS_DIR, generateVsCodeThemeDirectoryName(json, themeDirName));
    log.silly(log.prefix('install'), `Symlink will be created at: ${absSymlinkPath}`);

    // Determine if a symlink already exists.
    const symlinkExists = await fs.pathExists(absSymlinkPath);
    log.silly(log.prefix('install'), 'Symlink does not exist; it will be created.');

    if (symlinkExists) {
      const linkTarget = await fs.realpath(absSymlinkPath);

      if (linkTarget === absThemeOutDir) {
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

    await fs.ensureSymlink(absThemeOutDir, absSymlinkPath);
    log.verbose(log.prefix('install'), `Sym-linked ${log.chalk.green(absSymlinkPath)} => ${log.chalk.green(absThemeOutDir)}.`);
    log.info(log.prefix('install'), `Theme ${log.chalk.blue(themeDescriptor.label)} installed.`);
  }));
}
