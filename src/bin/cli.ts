#!/usr/bin/env node

import path from 'path';

import cli, {SaffronHandler} from '@darkobits/saffron';
import readPkgUp from 'read-pkg-up';

import {VSCTConfiguration} from 'etc/types';
import compile from 'lib/compile';
import install from 'lib/install';
import start from 'lib/start';
import log from 'lib/log';


/**
 * Wraps command functions to provide common logic for loading configuration
 * files and the host package's package.json.
 */
function commonHandler(handlerFn: Function) {
  return async ({argv, config, configPath}: Parameters<SaffronHandler<any, VSCTConfiguration>>[0]) => {
    try {
      if (!config || !configPath) {
        throw new Error('No configuration file found. Create a vsct.config.js file in your project directory.');
      }

      const packageInfo = await readPkgUp({cwd: configPath});

      if (!packageInfo) {
        throw new Error('Unable to load the project\'s package.json.');
      }

      const root = path.dirname(configPath);

      await handlerFn({
        args: argv,
        config,
        root,
        json: packageInfo.packageJson
      });
    } catch (err) {
      log.error(handlerFn.name, err.stack);
      process.exit(1);
    }
  };
}


// ----- Command: Compile ------------------------------------------------------

cli.command<any, VSCTConfiguration>({
  command: 'compile',
  config: {
    auto: false
  },
  description: 'Renders theme JSON for each theme defined in the project\'s configuration.',
  handler: commonHandler(compile)
});


// ----- Command: Install ------------------------------------------------------

cli.command<any, VSCTConfiguration>({
  command: 'install',
  config: {
    auto: false
  },
  description: 'Creates symlinks from VS Code back to rendered themes.',
  handler: commonHandler(install)
});


// ----- Command: Start --------------------------------------------------------

cli.command<any, VSCTConfiguration>({
  command: 'start',
  config: {
    auto: false
  },
  description: 'Compiles and installs themes, re-compiling on changes.',
  handler: commonHandler(start)
});


cli.init();
