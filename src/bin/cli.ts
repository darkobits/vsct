#!/usr/bin/env node

import path from 'path';

import * as cli from '@darkobits/saffron';

import {
  CLIHandlerFn,
  VSCTConfiguration,
  VSCTConfigurationFactory
} from 'etc/types';
import compile from 'lib/compile';
import dev from 'lib/dev';
import log from 'lib/log';
import start from 'lib/start';

import type { SaffronHandler, Arguments } from '@darkobits/saffron';


/**
 * Wraps command functions to provide common logic for loading configuration
 * files and the host package's package.json.
 */
function commonHandler(handlerFn: CLIHandlerFn, opts: { isDev?: boolean } = {}) {
  return async ({ argv, config, configPath, pkg }: Parameters<SaffronHandler<Arguments, VSCTConfiguration | VSCTConfigurationFactory>>[0]) => {
    try {
      if (!config || !configPath) throw new Error('Unable to find a VSCT configuration file.');
      if (!pkg?.json) throw new Error('Unable to find package.json.');

      const computedConfig = typeof config === 'function'
        ? config({
          json: pkg.json,
          // If we are using the "start" or "dev" commands, pass isDev=true to
          // config factories.
          isDev: Boolean(opts.isDev)
        })
        : config;

      const root = path.dirname(configPath);

      await handlerFn({
        args: argv,
        config: computedConfig,
        root,
        json: pkg.json
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
  handler: commonHandler(dev, { isDev: true })
});


// ----- Command: Start --------------------------------------------------------

cli.command<Arguments, VSCTConfiguration | VSCTConfigurationFactory>({
  command: 'start',
  config: {
    auto: false
  },
  description: 'Compiles and installs themes, re-compiling on changes.',
  handler: commonHandler(start, { isDev: true })
});


cli.init(yargs => {
  yargs.scriptName('vsct');
  // If no sub-command was provided, show help and exit.
  yargs.check(argv => {
    if (!argv._[0]) throw new Error('Error: No command provided.');
    return true;
  });
});
