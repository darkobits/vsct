/**
 * ===== Install ===============================================================
 *
 * This module is the handler for the "vsct install" command, which should be
 * part of a host package's "postinstall" NPM script. It is also run by the
 * "vsct start" command to symlink theme directories.
 */
import path from 'path';
import fs from 'fs-extra';

import { DEFAULT_OUT_DIR, EXTENSIONS_DIR } from 'etc/constants';
import { CLIHandlerOptions } from 'etc/types';
import log from 'lib/log';
import {
  // computeExtensionDisplayName,
  generateVsCodeThemeDirectoryName
} from 'lib/utils';


/**
 * For each theme in the host package's theme output directory, creates a
 * symbolic link from the VS Code theme directory to the theme's local
 * directory. This assumes that "vsct compile" has been run first.
 */
export default async function install({ /* args, */ root, config, json }: CLIHandlerOptions) {
  const runTime = log.createTimer();


  // ----- [1] Compute Paths ---------------------------------------------------

  // Compute the absolute path to the host package's theme output directory,
  // which will be the "source" directory from which we
  const absCompiledExtDir = path.resolve(root, config.outDir ?? DEFAULT_OUT_DIR);

  // Compute the absolute path to the symlink we will create in the VS Code
  // themes folder.
  const absSymlinkPath = path.join(EXTENSIONS_DIR, generateVsCodeThemeDirectoryName({ config, json }));


  // ----- [2] Gather Metadata -------------------------------------------------

  // Load the theme's manifest, a package.json nested in the output directory.
  const manifest = await fs.readJSON(path.join(absCompiledExtDir, 'package.json'));

  if (!manifest?.displayName || !manifest?.name) {
    throw new Error('Manifest did not contain a "name" or "displayName".');
  }

  if (!manifest?.contributes?.themes?.length) {
    throw new Error('Manifest did not contain any themes.');
  }

  // ----- [3] Compute Symlink Strategy ----------------------------------------

  // Determine if a symlink already exists.
  const symlinkExists = await fs.pathExists(absSymlinkPath);


  // NOTE: Temporarily experimenting with always un-linking and re-linking.
  if (symlinkExists) {
    // const linkTarget = await fs.realpath(absSymlinkPath);

    // if (linkTarget === absCompiledThemesDir) {
    //   // This flag is only used internally by the "start" command to suppress
    //   // this notification on re-compilations.
    //   if (!args.silent) {
    //     log.info(log.prefix('install'), `Theme ${log.chalk.blue(themeName)}
    //     already installed; skipping.`);
    //   }

    //   return;
    // }

    await fs.unlink(absSymlinkPath);
  }

  await fs.ensureSymlink(absCompiledExtDir, absSymlinkPath);


  // ----- [4] Print Results ---------------------------------------------------

  const extDisplayName = manifest.displayName;

  log.info(log.prefix('install'), `Installing extension: ${log.chalk.bold(extDisplayName)}`);
  log.verbose(log.prefix('install'), `Symlinked ${log.chalk.green(absSymlinkPath)} => ${log.chalk.green(absCompiledExtDir)}.`);

  manifest?.contributes?.themes?.forEach((entry: any) => {
    log.info(log.prefix('install'), `—— Installing theme: ${log.chalk.blue(entry.label)}`);
  });

  log.info(log.prefix('install'), `Installed ${log.chalk.yellow(manifest.contributes.themes.length)} ${manifest.contributes.themes.length === 1 ? 'theme' : 'themes'} in ${log.chalk.yellow(runTime)}.`);
}
