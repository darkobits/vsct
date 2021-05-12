/**
 * ===== Compile ===============================================================
 *
 * This module is the handler for the "vsct compile" command.
 */
import path from 'path';

import importUnique from '@darkobits/import-unique';
import fs from 'fs-extra';
import traverse from 'traverse';

import {CLIHandlerOptions, ThemeDescriptor} from 'etc/types';
import log from 'lib/log';
import {
  parsePackageName,
  toDirectoryName
} from 'lib/misc';


/**
 * Provided a path to a theme module, loads and validates the module.
 */
export async function loadThemeFromModule(absModulePath: string): Promise<any> {
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
export interface CompileThemeToJsonOptions {
  /**
   * Absolute path to the theme module to compile.
   */
  src: string;

  /**
   * Absolute path to where the compiled theme should be written.
   */
  dest: string;

  /**
   * Theme descriptor object from the user's VSCT configuration file.
   */
  themeDescriptor: ThemeDescriptor;
}


/**
 * Responsible for rendering a single theme to the host package's configured
 * theme output directory.
 */
async function compileThemeToJson({themeDescriptor, src, dest}: CompileThemeToJsonOptions) {
  try {
    // Ensure we can read from the theme module.
    await fs.access(src);

    // Ensure the destination directory exists.
    await fs.ensureDir(path.dirname(dest));

    log.verbose(log.prefix('compile'), 'Loading & compiling theme.');

    const theme = await loadThemeFromModule(src);

    log.verbose(log.prefix('compile'), `Loaded theme ${log.chalk.blueBright(themeDescriptor.label)} from ${log.chalk.green(src)}.`);

    // Write theme JSON.
    await fs.writeJson(dest, theme, {spaces: 2});

    log.info(log.prefix('compile'), `Wrote theme ${log.chalk.blueBright(themeDescriptor.label)} to ${log.chalk.green(dest)}.`);
  } catch (err) {
    if (err.message.match(/ENOENT/g)) {
      log.error(log.prefix('compile'), `Theme ${log.chalk.blueBright(themeDescriptor.label)} does not exist; skipping compilation.`);
      log.error(log.prefix('compile'), `↳ Attempted to load theme from: ${log.chalk.green(src)}`);
      return;
    }

    throw err;
  }
}


/**
 * Responsible re-compiling each theme defined in the user's configuration file.
 */
export default async function compile({config, root, json}: CLIHandlerOptions) {
  // Compute the absolute path to the directory we will write compiled themes
  // to.
  const absOutDir = path.resolve(root, config.outDir);

  // Compute the base name to use for for themes.
  const {name: themeBaseName, scope} = parsePackageName(json.name);


  // ----- [1] Prepare Output Directory ----------------------------------------

  // Remove and re-create the output directory.
  await fs.remove(absOutDir);
  await fs.ensureDir(absOutDir);

  log.verbose(log.prefix('compile'), `Themes will be compiled to ${log.chalk.green(absOutDir)}.`);


  // ----- [2] Prepare Manifest ------------------------------------------------

  log.verbose(log.prefix('compile'), 'Writing theme manifest.');

  // Compute the absolute path to the manifest we will create for the theme.
  const absManifestOutPath = path.resolve(absOutDir, 'package.json');

  // Build theme manifest.
  const manifest: any = {
    name: themeBaseName,
    displayName: json.displayName,
    version: json.version,
    description: json.description,
    publisher: json.author?.name ?? scope,
    repository: json.repository,
    categories: json.categories || ['Themes'],
    contributes: {
      themes: [] as Array<ThemeDescriptor>
    }
  };

  if (json.engines?.vscode) {
    manifest.engines = {
      vscode: json.engines.vscode
    };
  }


  // ----- [3] Compile Themes --------------------------------------------------

  let compilationHasErrors = false;

  await Promise.all(config.themes.map(async (themeDescriptor, index) => {
    const src = path.resolve(root, themeDescriptor.path);
    const dest = path.resolve(absOutDir, `${toDirectoryName(themeBaseName)}-${index}.json`);

    try {
      await compileThemeToJson({src, dest, themeDescriptor});

      manifest.contributes.themes.push({
        label: themeDescriptor.label,
        path: path.relative(absOutDir, dest),
        uiTheme: themeDescriptor.uiTheme ?? 'vs-dark'
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
}
