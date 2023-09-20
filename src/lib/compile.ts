/**
 * ===== Compile ===============================================================
 *
 * This module is the handler for the "vsct compile" command.
 */
import path from 'path';

import { dirname } from '@darkobits/fd-name';
import fs from 'fs-extra';
import { readPackageUp } from 'read-pkg-up';
import semver from 'semver';
import traverse from 'traverse';

import { DEFAULT_OUT_DIR } from 'etc/constants';
import {
  CLIHandlerOptions,
  ThemeDescriptor
} from 'etc/types';
import log from 'lib/log';
import { ThemeDefinition } from 'lib/theme';
import {
  computeExtensionName,
  computeExtensionDisplayName,
  computeExtensionPublisher,
  toDirectoryName
} from 'lib/utils';


/**
 * @private
 *
 * Provided a path to a JavaScript file:
 * - Loads
 */
async function loadThemeFromModule(absModulePath: string): Promise<ThemeDefinition> {
  await fs.access(absModulePath);

  // Load/parse the indicated theme file.
  const importResult = await import(`${absModulePath}?cache-bust=${Date.now()}`);
  const theme = importResult.default ?? importResult;

  // Scrub theme for circular references and functions.
  traverse(theme).forEach(function(node) {
    if (this.circular)
      throw new Error('Theme contains circular references, which are non-serializable.');

    if (typeof node === 'function')
      throw new TypeError('Theme contains functions, which are non-serializable.');
  });

  // If there is anything else that the theme exported that's not valid JSON,
  // this will throw.
  JSON.stringify(theme);

  return theme;
}


/**
 * Shape of the options object expected by compileThemeToJson.
 */
interface CompileThemeToJsonOptions {
  /**
   * Absolute path to the theme module to compile.
   */
  src: string;

  /**
   * Absolute path to where the compiled theme JSON should be written.
   */
  dest: string;

  /**
   * Theme descriptor for the current theme being compiled.
   */
  descriptor: ThemeDescriptor;
}


/**
 * @private
 *
 * Responsible for rendering a single theme to the host package's configured
 * theme output directory.
 */
async function compileThemeToJson({ src, dest, descriptor }: CompileThemeToJsonOptions) {
  try {
    // Ensure we can read from the theme module.
    await fs.access(src);

    // Ensure the destination directory exists.
    await fs.ensureDir(path.dirname(dest));

    // Load / parse theme module.
    const theme = await loadThemeFromModule(src);

    log.info(log.prefix('compile'), `Compiling theme: ${log.chalk.blue(descriptor.label)}`);
    log.verbose(log.prefix('compile'), `Entrypoint: ${log.chalk.green(src)}`);

    // Write theme JSON.
    await fs.writeJson(dest, theme, { spaces: 2 });

    log.verbose(log.prefix('compile'), `Output: ${log.chalk.green(dest)}.`);

    return theme;
  } catch (err: any) {
    if (/ENOENT/g.test(err.message)) {
      log.error(log.prefix('compile'), `Theme at ${log.chalk.green(src)} does not exist; skipping compilation.`);
      log.error(log.prefix('compile'), ` Attempted to load theme from: ${log.chalk.green(src)}`);
      // return;
    }

    throw err;
  }
}


/**
 * Responsible for compiling each theme defined in the user's configuration
 * file.
 */
export default async function compile({ config, root, isDev }: CLIHandlerOptions) {
  const runTime = log.createTimer();

  // ----- [1] Gather Theme Info -----------------------------------------------

  const packageResult = await readPackageUp({ cwd: root });
  if (!packageResult) throw new Error(`Unable to a find package.json from ${root}.`);
  const json = packageResult.packageJson;

  // Compute the absolute path to the directory we will write compiled themes
  // to.
  const absOutDir = path.resolve(root, config.outDir ?? DEFAULT_OUT_DIR);

  // Compute name and display name.
  const extensionName = computeExtensionName({ config, json });
  const extensionDisplayName = computeExtensionDisplayName({ config, json });

  log.info(log.prefix('compile'), `Compiling extension: ${log.chalk.bold(extensionDisplayName)}`);


  // ----- [2] Prepare Output Directory ----------------------------------------

  // Remove and re-create the output directory.
  await fs.remove(absOutDir);
  await fs.ensureDir(absOutDir);

  log.verbose(log.prefix('compile'), `Output: ${log.chalk.green(absOutDir)}`);


  // ----- [3] Prepare Manifest ------------------------------------------------

  // Compute the absolute path to the manifest we will create for the theme.
  const absManifestOutPath = path.resolve(absOutDir, 'package.json');

  // Build extension manifest.
  const manifest: any = {
    name: `${json.name}${isDev ? '-dev' : ''}`,
    displayName: extensionDisplayName,
    version: isDev ? semver.inc(json.version, 'prerelease', 'dev') : json.version,
    description: json.description,
    publisher: computeExtensionPublisher({ config, json }),
    license: json.license,
    type: 'module',
    repository: json.repository,
    keywords: json.keywords,
    categories: json.categories || ['Themes'],
    scripts: {
      postinstall: 'node install.js'
    },
    contributes: {
      themes: [] as Array<ThemeDescriptor>
    }
  };

  // Copy the "engines.vscode" value from package.json to the theme's manifest.
  if (json.engines?.vscode) {
    manifest.engines = {
      vscode: json.engines.vscode
    };
  }


  // ----- [4] Compile Themes --------------------------------------------------

  let compilationHasErrors = false;

  await Promise.all(config.themes.map(async (originalThemeDescriptor, index) => {
    const themeJsonFilename = `${extensionName}-${index}`;
    const dest = path.resolve(absOutDir, `${toDirectoryName(themeJsonFilename)}.json`);

    const themeDescriptor = {
      ...originalThemeDescriptor,
      label: isDev
        ? `${originalThemeDescriptor.label} (Dev)`
        : originalThemeDescriptor.label
    };

    try {
      await compileThemeToJson({
        src: path.resolve(root, themeDescriptor.path),
        dest,
        descriptor: themeDescriptor
      });

      manifest.contributes.themes.push({
        label: themeDescriptor.label,
        path: path.relative(absOutDir, dest),
        uiTheme: themeDescriptor.uiTheme
      });
    } catch (err: any) {
      log.error(log.prefix('compile'), err.stack);
      console.error(err);
      compilationHasErrors = true;
    }
  }));

  if (compilationHasErrors) {
    await fs.remove(absOutDir);
    throw new Error('Compilation finished with errors.');
  }


  // ----- [5] Copy Optional Files ---------------------------------------------

  // See: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#advanced-usage
  const optionalFiles = ['README.md', 'CHANGELOG.md', 'LICENSE'];

  await Promise.all(optionalFiles.map(async fileName => {
    const hasFile = await fs.pathExists(path.join(root, fileName));

    if (hasFile) {
      log.verbose(log.prefix('compile'), `Adding ${log.chalk.green(fileName)} to output directory.`);
      await fs.copyFile(path.join(root, fileName), path.join(absOutDir, fileName));
    }
  }));


  // ----- [6] Copy Install Script ---------------------------------------------

  const ourDirname = dirname();
  if (!ourDirname) throw new Error('Unable to compute current directory name.');

  const installScriptPath = path.join(ourDirname, '..', 'etc', 'install.js');
  await fs.copyFile(installScriptPath, path.join(absOutDir, 'install.js'));


  // ----- [7] Write Manifest --------------------------------------------------

  await fs.writeJson(absManifestOutPath, manifest, {spaces: 2});
  log.verbose(log.prefix('compile'), `Wrote extension manifest to: ${log.chalk.green(absManifestOutPath)}`);


  const numThemes = manifest.contributes.themes.length;
  log.info(log.prefix('compile'),
    `Compiled ${log.chalk.bold(numThemes)} ${numThemes === 1 ? 'theme' : 'themes'} in ${log.chalk.yellow(runTime)}.`
  );
}
