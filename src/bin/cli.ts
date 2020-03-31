#!/usr/bin/env node

import path from 'path';

import cli from '@darkobits/saffron';

import {VSCTConfiguration} from 'etc/types';
import compile from 'lib/compile';
import install from 'lib/install';
import start from 'lib/start';
import log from 'lib/log';


// ----- Command: Compile ------------------------------------------------------

cli.command<any, VSCTConfiguration>({
  command: 'compile',
  config: {
    auto: false
  },
  description: 'Renders theme JSON for each theme defined in the project\'s configuration.',
  handler: async ({argv, config, configPath, packageJson}) => {
    try {
      if (!config || !configPath) {
        throw new Error('No configuration file found.');
      }

      if (!packageJson) {
        throw new Error('Unable to load package.json');
      }

      await compile({
        args: argv,
        config,
        root: path.dirname(configPath),
        json: packageJson
      });
    } catch (err) {
      log.error('compile', err.stack);
      throw err;
    }
  }
});


// ----- Command: Install ------------------------------------------------------

cli.command<any, VSCTConfiguration>({
  command: 'install',
  config: {
    auto: false
  },
  description: 'Creates symlinks from VS Code back to rendered themes.',
  handler: async ({argv, config, configPath, packageJson}) => {
    try {
      if (!config || !configPath) {
        throw new Error('No configuration file found.');
      }

      if (!packageJson) {
        throw new Error('Unable to load package.json');
      }

      await install({
        args: argv,
        config,
        root: path.dirname(configPath),
        json: packageJson
      });
    } catch (err) {
      log.error('install', err.stack);
      throw err;
    }
  }
});


// ----- Command: Start --------------------------------------------------------

cli.command<any, VSCTConfiguration>({
  command: 'start',
  config: {
    auto: false
  },
  description: 'Compiles and installs themes, re-compiling on changes.',
  handler: async ({argv, config, configPath, packageJson}) => {
    try {
      if (!config || !configPath) {
        throw new Error('No configuration file found.');
      }

      if (!packageJson) {
        throw new Error('Unable to load package.json');
      }

      await start({
        args: argv,
        config,
        root: path.dirname(configPath),
        json: packageJson
      });
    } catch (err) {
      log.error('install', err.stack);
      throw err;
    }
  }
});


cli.init();
