#!/usr/bin/env node

import path from 'path';

import readPkgUp from 'read-pkg-up';
import yargs from 'yargs';

import compile from 'lib/compile';
import install from 'lib/install';
import loadConfig from 'lib/load-config';
import log from 'lib/log';
import start from 'lib/start';


function createHandler(logLabel: string, handlerFn: Function): yargs.CommandModule['handler'] {
  return async (args: yargs.Arguments) => {
    try {
      const pkgInfo = await readPkgUp();

      await handlerFn({
        args,
        config: loadConfig(),
        root: path.parse(pkgInfo.path).dir,
        json: pkgInfo.pkg
      });
    } catch (err) {
      log.error(logLabel, err.message);
      process.exit(1);
    }
  };
}


export default yargs.command({
    command: 'compile',
    describe: 'Renders theme JSON for each theme defined in .vsctrc.',
    handler: createHandler('compile', compile)
  })
  .command({
    command: 'install',
    describe: 'Creates symlinks from VS Code back to rendered theme JSON files.',
    handler: createHandler('install', install)
  })
  .command({
    command: 'start',
    describe: 'Compiles and installs themes, re-compiling on changes.',
    handler: createHandler('start', start)
  })
  .demandCommand(1, 'No command provided.')
  .wrap(yargs.terminalWidth())
  .version()
  .strict()
  .help()
  .argv;
