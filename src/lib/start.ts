/**
 * ===== Start ===============================================================
 *
 * This module is the handler for the "vsct start" command. It composes the
 * "compile" and "install" commands and re-compiles themes when their source
 * files change.
 */
import path from 'path';

import Bottleneck from 'bottleneck';
import chalk from 'chalk';
import chokidar from 'chokidar';

import {CLIHandlerOptions} from 'etc/types';
import compile from 'lib/compile';
import install from 'lib/install';
import log from 'lib/log';
import {clearRequireCache, sleep, uniq} from 'lib/misc';


export default async function start({args, config, root, json}: CLIHandlerOptions) {
  // Get a unique list of absolute paths resolved from the "main" entry in each
  // theme descriptor object in the user's .vsctrc file.
  const absThemeDirs = uniq(config.themes.map(themeDescriptor => path.parse(path.resolve(root, themeDescriptor.main)).dir));

  // Create a watcher that watches each of the above directories.
  const watcher = chokidar.watch(absThemeDirs, {
    ignoreInitial: true
  });

  // Create a new limiter that will only allow one compilation to occur at a
  // time.
  const limiter = new Bottleneck({
    minTime: 500,
    maxConcurrent: 1,
    highWater: 0,
    strategy: Bottleneck.strategy.OVERFLOW
  });

  // Create a rate-limited function that will recompile and reinstall themes.
  const limitedRecompile = limiter.wrap(async () => {
    try {
      clearRequireCache();

      // Mildly hacky, but we need to wait a small amount of time for the user's
      // compilation to finish before we start reading files, or we may get
      // stale data.
      await sleep(250);

      await compile({args, config, root, json});
      await install({args: {...args, silent: true}, config, root, json});
    } catch (err) {
      if (err.message.match(/EEXIST/g)) {
        // Ignore EEXIST errors on install.
      } else {
        log.error('watch', err.message);
      }
    }
  });

  // Wrapper that invokes the above function and silences errors from dropped
  // jobs.
  async function invokeLimitedRecompile() {
    try {
      await limitedRecompile.withOptions({
        priority: Date.now()
      });
    } catch (err) {
      // @ts-ignore
      if (err instanceof Bottleneck.BottleneckError) {
        log.silly('start', 'Job cancelled by rate-limiter.');
        return;
      }

      log.error('start', `Error during compilation: ${err.message}`);
      throw err;
    }
  }

  watcher.on('ready', async () => {
    absThemeDirs.forEach(themeDir => {
      log.info('start', `Watching ${chalk.green(themeDir)}.`);
    });

    return invokeLimitedRecompile();
  });

  watcher.on('add', async filePath => {
    log.verbose('watch', `Added: ${chalk.green(filePath)}.`);
    return invokeLimitedRecompile();
  });

  watcher.on('change', async filePath => {
    log.verbose('watch', `Changed: ${chalk.green(filePath)}.`);
    return invokeLimitedRecompile();
  });
}
