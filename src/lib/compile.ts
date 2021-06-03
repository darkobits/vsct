/**
 * ===== Compile ===============================================================
 *
 * This module is the handler for the "vsct compile" command.
 */
import path from 'path';

import importUnique from '@darkobits/import-unique';
import fs from 'fs-extra';
import traverse from 'traverse';

import { DEFAULT_OUT_DIR } from 'etc/constants';
import { CLIHandlerOptions, ThemeDescriptor } from 'etc/types';
import log from 'lib/log';
import { ThemeDefinition } from 'lib/theme';
import {
  computeExtensionName,
  computeExtensionDisplayName,
  computeExtensionAuthor,
  toDirectoryName
} from 'lib/utils';


/**
 * @private
 *
 * Provided a path to a JavaScript file:
 * - Loads  whose default export is an instance of
 * ThemeDefinition, loads and
 */
async function loadThemeFromModule(absModulePath: string): Promise<ThemeDefinition> {
  await fs.access(absModulePath);

  // Load/parse the indicated theme file.
  const module = importUnique(absModulePath);
  const theme = module.default ? module.default : module;

  // Scrub theme for circular references and functions.
  traverse(theme).forEach(function(node) {
    if (this.circular) {
      throw new Error('Theme contains circular references.');
    }

    if (typeof node === 'function') {
      throw new TypeError('Theme contains non-serializable entities.');
    }
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
}


/**
 * @private
 *
 * Responsible for rendering a single theme to the host package's configured
 * theme output directory.
 */
async function compileThemeToJson({ src, dest }: CompileThemeToJsonOptions) {
  try {
    // Ensure we can read from the theme module.
    await fs.access(src);

    // Ensure the destination directory exists.
    await fs.ensureDir(path.dirname(dest));

    // Load / parse theme module.
    const theme = await loadThemeFromModule(src);

    // Ensure theme has a label.
    if (!theme.label) {
      throw new Error(`Theme at ${log.chalk.green(src)} does not have required property "label". Use .set('label', ...) to set it.`);
    }

    log.info(log.prefix('compile'), `—— Compiling theme: ${log.chalk.blue(theme.label)}`);
    log.info(log.prefix('compile'), `—— Entrypoint: ${log.chalk.green(src)}`);

    // Write theme JSON.
    await fs.writeJson(dest, theme, { spaces: 2 });

    log.info(log.prefix('compile'), `—— Target: ${log.chalk.green(dest)}.`);

    return theme;
  } catch (err) {
    if (err.message.match(/ENOENT/g)) {
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
export default async function compile({ config, root, json }: CLIHandlerOptions) {
  const runTime = log.createTimer();

  // Compute the absolute path to the directory we will write compiled themes
  // to.
  const absOutDir = path.resolve(root, config.outDir ?? DEFAULT_OUT_DIR);

  // Compute name and display name.
  const extensionName = computeExtensionName({ config, json });
  const extensionDisplayName = computeExtensionDisplayName({ config, json });

  log.info(log.prefix('compile'), `Compiling extension: ${log.chalk.bold(extensionDisplayName)}`);


  // ----- [1] Prepare Output Directory ----------------------------------------

  // Remove and re-create the output directory.
  await fs.remove(absOutDir);
  await fs.ensureDir(absOutDir);

  log.info(log.prefix('compile'), `Output: ${log.chalk.green(absOutDir)}`);


  // ----- [2] Prepare Manifest ------------------------------------------------

  // Compute the absolute path to the manifest we will create for the theme.
  const absManifestOutPath = path.resolve(absOutDir, 'package.json');

  // Build extension manifest.
  const manifest: any = {
    name: extensionName,
    displayName: extensionDisplayName,
    version: json.version,
    description: json.description,
    publisher: computeExtensionAuthor({ json }),
    keywords: json.keywords,
    repository: json.repository,
    categories: json.categories || ['Themes'],
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


  // ----- [3] Compile Themes --------------------------------------------------

  let compilationHasErrors = false;

  await Promise.all(config.themes.map(async (themeDescriptor, index) => {
    const themeJsonFilename = `${extensionName}-${index}`;
    const dest = path.resolve(absOutDir, `${toDirectoryName(themeJsonFilename)}.json`);

    try {
      const theme = await compileThemeToJson({
        src: path.resolve(root, themeDescriptor.path),
        dest
      });

      manifest.contributes.themes.push({
        label: theme.label,
        path: path.relative(absOutDir, dest),
        uiTheme: theme.uiTheme
      });
    } catch (err) {
      log.error(log.prefix('compile'), err.stack);
      compilationHasErrors = true;
    }
  }));

  if (compilationHasErrors) {
    await fs.remove(absOutDir);
    throw new Error('Compilation finished with errors.');
  }


  // ----- [4] Copy Optional Files ---------------------------------------------

  // See: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#advanced-usage
  const optionalFiles = ['README.md', 'CHANGELOG.md', 'LICENSE'];

  await Promise.all(optionalFiles.map(async fileName => {
    const hasFile = await fs.pathExists(path.join(root, fileName));

    if (hasFile) {
      log.verbose(log.prefix('compile'), `Adding ${log.chalk.green(fileName)} to output directory.`);
      await fs.copyFile(path.join(root, fileName), path.join(absOutDir, fileName));
    }
  }));


  // ----- [5] Write Manifest --------------------------------------------------

  await fs.writeJson(absManifestOutPath, manifest, {spaces: 2});
  log.info(log.prefix('compile'), `Wrote manifest to: ${log.chalk.green(absManifestOutPath)}`);


  const numThemes = manifest.contributes.themes.length;
  log.info(log.prefix('compile'),
    `Compiled ${log.chalk.bold(numThemes)} ${numThemes === 1 ? 'theme' : 'themes'} in ${log.chalk.yellow(runTime)}.`
  );
}
