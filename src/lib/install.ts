/**
 * ===== Install ===============================================================
 *
 * This module is the handler for the "vsct install" command.
 */
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import {EXTENSIONS_DIR} from 'etc/constants';
import {CLIHandlerOptions} from 'etc/types';
import log from 'lib/log';

import {
  parseThemeLabel,
  generateThemeDirName,
  generateVsCodeThemeDirectoryName
} from 'lib/misc';


/**
 * For each theme in the host package's theme output directory, creates a
 * symbolic link from the VS Code theme direcotry to the theme's local
 * directory. This assumes that "vsct compile" has been run first.
 */
export default async function install({args, root, config, json}: CLIHandlerOptions) {
  // Compute the absolute path to the output directory.
  const absThemesDir = path.resolve(root, config.outDir);

  return Promise.all(config.themes.map(async themeDescriptor => {
    // Compute the human-friendly display name/label to use for the theme by
    // evaluating any tokens used (ie: ${version}).
    const parsedThemeLabel = parseThemeLabel(themeDescriptor.label, json);

    // Generate a subfolder name to use for the theme.
    const themeDirName = generateThemeDirName(parsedThemeLabel);

    // Compute the absoltue path to the theme's output folder.
    const absThemeOutDir = path.resolve(absThemesDir, themeDirName);

    // Compute the absolute path to the symlink we will create in the VS Code
    // themes folder.
    const absSymlinkPath = path.join(EXTENSIONS_DIR, generateVsCodeThemeDirectoryName(json, themeDirName));

    // Determine if a symlink already exists.
    const symlinkExists = await fs.pathExists(absSymlinkPath);

    if (symlinkExists) {
      const linkTarget = await fs.realpath(absSymlinkPath);

      if (linkTarget === absThemeOutDir) {
        // This flag is only used internally by the "start" command to suppress
        // this notification on re-compilations.
        if (!args.silent) {
          log.info('install', `Theme ${chalk.blue(parsedThemeLabel)} already installed; skipping.`);
        }

        return;
      }

      // If the link exists but points to another target, remove it.
      await fs.unlink(absSymlinkPath);
    }

    await fs.symlink(absThemeOutDir, absSymlinkPath);
    log.info('install', `Symlinked ${chalk.green(absSymlinkPath)} => ${chalk.green(absThemeOutDir)}.`);
  }));
}
