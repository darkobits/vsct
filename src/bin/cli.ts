#!/usr/bin/env node

import path from 'path';

import cli, { SaffronHandler, Arguments } from '@darkobits/saffron';
import { readPackageUp } from 'read-pkg-up';

import {
  CLIHandlerFn,
  VSCTConfiguration,
  VSCTConfigurationFactory
} from 'etc/types';
import compile from 'lib/compile';
import dev from 'lib/dev';
import log from 'lib/log';
import start from 'lib/start';


/**
 * Wraps command functions to provide common logic for loading configuration
 * files and the host package's package.json.
 */
function commonHandler(handlerFn: CLIHandlerFn) {
  return async ({ argv, config, configPath }: Parameters<SaffronHandler<Arguments, VSCTConfiguration | VSCTConfigurationFactory>>[0]) => {
    try {
      if (!config || !configPath) {
        throw new Error('No configuration file found. Create a vsct.config.js file in your project directory.');
      }

      const packageInfo = await readPackageUp({cwd: configPath});

      if (!packageInfo) {
        throw new Error('Unable to load the project\'s package.json.');
      }

      const computedConfig = typeof config === 'function' ? config({
        json: packageInfo?.packageJson,
        // If we are using the "start" or "dev" commands, pass isDev=true to
        // config factories.
        isDev: ['dev', 'start'].includes(argv._[0] as string)
      }) : config;

      const root = path.dirname(configPath);

      await handlerFn({
        args: argv,
        config: computedConfig,
        root,
        json: packageInfo.packageJson
      });
    } catch (err: any) {
      log.error(log.prefix(handlerFn.name), err.stack);
      process.exit(1);
    }
  };
}


// ----- Command: Compile ------------------------------------------------------

cli.command<Arguments, VSCTConfiguration | VSCTConfigurationFactory>({
  command: 'compile',
  config: {
    auto: false
  },
  description: 'Renders theme JSON for each theme defined in the project\'s configuration.',
  handler: commonHandler(compile)
});


// ----- Command: Dev ------------------------------------------------------

cli.command<Arguments, VSCTConfiguration | VSCTConfigurationFactory>({
  command: 'dev',
  config: {
    auto: false
  },
  description: 'Creates a symlink in the VS Code extensions directory to the local theme.',
  handler: commonHandler(dev)
});


// ----- Command: Start --------------------------------------------------------

cli.command<Arguments, VSCTConfiguration | VSCTConfigurationFactory>({
  command: 'start',
  config: {
    auto: false
  },
  description: 'Compiles and installs themes, re-compiling on changes.',
  handler: commonHandler(start)
});


cli.init(yargs => {
  yargs.strict(true);
  yargs.showHelpOnFail(true);
  yargs.check(argv => {
    if (!argv._[0]) {
      throw new Error('Error: No command provided.');
    }

    return true;
  });
});
