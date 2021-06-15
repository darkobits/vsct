/**
 * ===== Start ===============================================================
 *
 * This module is the handler for the "vsct start" command. It composes the
 * "compile" and "install" commands and re-compiles themes when their source
 * files change.
 */
import path from 'path';

import Bottleneck from 'bottleneck';
import chokidar from 'chokidar';

import {CLIHandlerOptions} from 'etc/types';
import compile from 'lib/compile';
import dev from 'lib/dev';
import log from 'lib/log';
import { clearRequireCache } from 'lib/utils';


/**
 * Provided a watcher instance, returns a Promise that resolves once the watcher
 * receives an 'add' event and then goes 'delay' milliseconds without receiving
 * an 'add' event. This is a heuristic that should generally tell us when a
 * transpiler (ie: Babel) has finished writing files to its output directory.
 */
async function waitForThemeFilesToBecomeAvailable(watcher: chokidar.FSWatcher, delay = 100) {
  return new Promise<void>(resolve => {
    log.info(log.prefix('start'), 'Waiting for source files.');

    let lastFileAddedOn = Infinity;

    watcher.on('add', () => {
      lastFileAddedOn = Date.now();
    });

    const intervalHandle = setInterval(() => {
      if (Date.now() - lastFileAddedOn > delay) {
        log.info(log.prefix('start'), 'Source files ready.');
        resolve();
        clearInterval(intervalHandle);
      }
    }, 100);
  });
}


export default function start({args, config, root, json}: CLIHandlerOptions) {
  // Get a unique list of absolute paths resolved from the "main" entry in each
  // theme descriptor object in the user's VSCT configuration file.
  const absThemeDirs = [...new Set(config.themes.map(themeDescriptor => {
    return path.parse(path.resolve(root, themeDescriptor.path)).dir;
  }))];

  // Create a watcher that watches each of the above directories.
  const watcher = chokidar.watch(absThemeDirs, {
    ignoreInitial: true
  });

  const compilationReadyPromise = waitForThemeFilesToBecomeAvailable(watcher, 500);

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

      // Wait until the theme's source files are available before we try to read
      // them.
      await compilationReadyPromise;

      await compile({args, config, root, json});
      await dev({args: {...args, silent: true}, config, root, json});
    } catch (err) {
      if (err.message.match(/EEXIST/g)) {
        // Ignore EEXIST errors on install.
      } else {
        log.error(log.prefix('start'), `Watcher error: ${err.stack}`);
      }
    }
  });

  // Wrapper that invokes the above function and silences errors from dropped
  // jobs.
  const invokeLimitedRecompile = async () => {
    try {
      await limitedRecompile.withOptions({
        priority: Date.now()
      });
    } catch (err) {
      // @ts-ignore
      if (err instanceof Bottleneck.BottleneckError) {
        log.silly(log.prefix('start'), 'Job cancelled by rate-limiter.');
        return;
      }

      log.error(log.prefix('start'), `Error during compilation: ${err.stack}`);
      throw err;
    }
  };

  watcher.on('ready', () => {
    log.verbose(log.prefix('start'), 'Watcher ready.');

    absThemeDirs.forEach(themeDir => {
      log.info(log.prefix('start'), `Watching ${log.chalk.green(themeDir)}.`);
    });

    void invokeLimitedRecompile();
  });

  watcher.on('add', filePath => {
    log.verbose(log.prefix('watch'), `Added: ${log.chalk.green(filePath)}.`);
    void invokeLimitedRecompile();
  });

  watcher.on('change', filePath => {
    log.verbose(log.prefix('watch'), `Changed: ${log.chalk.green(filePath)}.`);
    void invokeLimitedRecompile();
  });
}
