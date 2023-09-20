/**
 * ===== Dev ===================================================================
 *
 * This module is the handler for the "vsct dev" command. It executes a compiled
 * extension's installer script to create a symlink from the VS Code extensions
 * directory to the directory from which the extension resides.
 */
import path from 'path';

import LogPipe from '@darkobits/log/dist/lib/log-pipe.js';
import { execa } from 'execa';
import fs from 'fs-extra';

import { DEFAULT_OUT_DIR } from 'etc/constants';
import { CLIHandlerOptions } from 'etc/types';
import log from 'lib/log';


let lastLine: string;


/**
 * Creates a symbolic link from the VS Code extensions directory to the local
 * directory where the compiled extension resides. This assumes that "vsct
 * compile" has been run first.
 */
export default async function dev({ /* args, */ root, config }: CLIHandlerOptions) {
  const absCompiledExtDir = path.resolve(root, config.outDir ?? DEFAULT_OUT_DIR);
  const installScriptPath = path.join(absCompiledExtDir, 'install.mjs');

  try {
    await fs.access(absCompiledExtDir);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`Directory ${log.chalk.green(absCompiledExtDir)} does not exist. Ensure themes have been compiled before trying to install them.`);
    }

    throw err;
  }

  try {
    await fs.access(installScriptPath);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`Install script does not exist at ${log.chalk.green(installScriptPath)}. Re-compile themes and try again.`);
    }

    throw err;
  }

  const command = execa(installScriptPath, {
    cwd: absCompiledExtDir,
    stdio: 'pipe',
    env: {
      VSCT_DEV: 'true'
    }
  });

  command.stdout?.pipe(new LogPipe((line: string) => {
    if (lastLine !== line) {
      log.info(log.prefix('dev'), line);
    }

    lastLine = line;
  }));

  command.stderr?.pipe(new LogPipe((line: string) => {
    log.error(log.prefix('dev'), line);
  }));

  await command;
}
