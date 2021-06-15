/**
 * ===== Install ===============================================================
 *
 * This module is the handler for the "vsct install" command. It executes a
 * compiled extension's installer to create a symlink from the VS Code
 * extensions directory to the directory from which the installer resides.
 */
import path from 'path';

import LogPipe from '@darkobits/log/dist/lib/log-pipe';
import execa from 'execa';
import fs from 'fs-extra';

import { DEFAULT_OUT_DIR } from 'etc/constants';
import { CLIHandlerOptions } from 'etc/types';
import log from 'lib/log';


let lastLine: string;


/**
 * For each theme in the host package's theme output directory, creates a
 * symbolic link from the VS Code theme directory to the theme's local
 * directory. This assumes that "vsct compile" has been run first.
 */
export default async function install({ /* args, */ root, config }: CLIHandlerOptions) {
  const absCompiledExtDir = path.resolve(root, config.outDir ?? DEFAULT_OUT_DIR);
  const installScriptPath = path.join(absCompiledExtDir, 'install.js');

  try {
    await fs.access(absCompiledExtDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Directory ${log.chalk.green(absCompiledExtDir)} does not exist. Ensure themes have been compiled before trying to install them.`);
    }

    throw err;
  }

  try {
    await fs.access(installScriptPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Install script does not exist at ${log.chalk.green(installScriptPath)}. Re-compile themes and try again.`);
    }

    throw err;
  }

  const command = execa(installScriptPath, {
    cwd: absCompiledExtDir,
    stdout: 'pipe'
  });

  command.stdout?.pipe(new LogPipe((line: string) => {
    if (lastLine !== line) {
      log.info(log.prefix('install'), line);
    }

    lastLine = line;
  }));

  await command;
}
