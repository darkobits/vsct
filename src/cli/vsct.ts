#!/usr/bin/env node

import yargs from 'yargs';
import compile from 'lib/compile';
import install from 'lib/install';
import loadConfig from 'lib/load-config';
import log from 'lib/log';
import pkgInfo from 'lib/pkg-info';
import start from 'lib/start';


export default yargs.command({
  command: 'compile',
  describe: 'Renders theme JSON for each theme defined in .vsctrc.',
  async handler(args: yargs.Arguments) {
    try {
      const config = await loadConfig();
      const {root, json} = await pkgInfo();
      await compile({args, config, root, json});
    } catch (err) {
      log.error('compile', err.message);
      process.exit(1);
    }
  }
})
.command({
  command: 'install',
  describe: 'Creates symlinks from VS Code back to rendered theme JSON files.',
  async handler(args: yargs.Arguments) {
    try {
      const config = await loadConfig();
      const {root, json} = await pkgInfo();
      await install({args, config, root, json});
    } catch (err) {
      log.error('install', err.message);
      process.exit(1);
    }
  }
})
.command({
  command: 'start',
  describe: 'Compiles and installs themes, re-compiling on changes.',
  async handler(args: yargs.Arguments) {
    try {
      const config = await loadConfig();
      const {root, json} = await pkgInfo();
      await start({args, config, root, json});
    } catch (err) {
      log.error('start', err.message);
      process.exit(1);
    }
  }
})
.demandCommand(1, 'No command provided.')
.wrap(yargs.terminalWidth())
.version()
.strict()
.help()
.argv;
