/**
 * ===== Compile ===============================================================
 *
 * This module is the handler for the "vsct compile" command.
 */
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import {CLIHandlerOptions, LooseObject, ThemeDescriptor} from 'etc/types';
import log from 'lib/log';

import {
  generateThemeDirName,
  getVsCodeVersion,
  loadThemeFromModule,
  parseThemeLabel,
} from 'lib/misc';

import {getUnscopedName} from 'lib/pkg-info';


/**
 * Shape of the options object expected by compileThemeToJson.
 */
export interface CompileThemeToJsonOptions {
  /**
   * Absolute path to the root of the host package.
   */
  absBaseDir: string;

  /**
   * Absolute path to the themes output folder (user configurable).
   */
  absOutDir: string;

  /**
   * Parsed contents of the host's package.json.
   */
  json: LooseObject;

  /**
   * Theme descriptor object from the user's .vsctrc file.
   */
  themeDescriptor: ThemeDescriptor;
}


/**
 * Responsible for rendering a single theme to the host package's configured
 * theme output directory.
 */
async function compileThemeToJson({absBaseDir, absOutDir, themeDescriptor, json}: CompileThemeToJsonOptions) {
  // ----- [1] Compute Paths & Prepare Output Directory ------------------------

  // Compute absolute path to the theme module.
  const absThemeSrcPath = path.resolve(absBaseDir, themeDescriptor.main);

  // Get the base file name of the theme module.
  const themeBaseName = path.parse(absThemeSrcPath).name;

  // Compute the human-friendly display name/label to use for the theme by
  // evaluating any tokens used (ie: ${version}).
  const parsedThemeLabel = parseThemeLabel(themeDescriptor.label, json);

  // Generate a subfolder name to use for the theme.
  const themeDirName = generateThemeDirName(parsedThemeLabel);
  // Compute the absolute path to the current theme's subfolder in the host's
  // theme output directory.
  const absThemeOutDir = path.resolve(absOutDir, themeDirName);

  // Create a directory for the current theme's compiled artifacts.
  await fs.ensureDir(absThemeOutDir);

  // Compute the absolute path to the theme JSON file we will render/copy.
  const absThemeOutPath = path.resolve(absThemeOutDir, `${themeBaseName}.json`);


  // ----- [2] Validate Paths & Files ------------------------------------------

  const themeExists = await fs.pathExists(absThemeSrcPath);

  if (!themeExists) {
    throw new Error(`Theme ${chalk.blue(parsedThemeLabel)} could not be found.`);
  }


  // ----- [3] Write Theme Manifest --------------------------------------------

  // Compute the absolute path to the manifest we will create for the theme.
  const absManifestOutPath = path.resolve(absThemeOutDir, 'package.json');

  const vsCodeVersion = await getVsCodeVersion();

  // Build theme manifest.
  const manifest = {
    name: getUnscopedName(json.name),
    version: json.version,
    publisher: json.author.name,
    engines: {
      vscode: `^${vsCodeVersion}`
    },
    categories: [
      'Themes'
    ],
    contributes: {
      themes: [
        {
          label: parsedThemeLabel,
          path: path.relative(absThemeOutDir, absThemeOutPath),
          uiTheme: themeDescriptor.uiTheme || 'vs-dark'
        }
      ]
    }
  };

  await fs.writeJson(absManifestOutPath, manifest, {spaces: 2});


  // ----- [4a] Load & Compile Theme -------------------------------------------

  if (themeDescriptor.type === 'uncompiled' || themeDescriptor.type === undefined) {
    let theme;

    try {
      theme = await loadThemeFromModule(absThemeSrcPath);
    } catch (err) {
      if (err.message.match(/ENOENT/g)) {
        log.error('compile', `Theme ${chalk.blue(parsedThemeLabel)} does not exist; skipping compilation.`);
        return;
      }

      throw err;
    }

    log.verbose('compile', `Loaded theme ${chalk.blue(parsedThemeLabel)} from ${chalk.green(absThemeSrcPath)}.`);

    // Write theme JSON.
    await fs.writeJson(absThemeOutPath, theme, {spaces: 2});
    log.info('compile', `Wrote theme ${chalk.blue(parsedThemeLabel)}.`);

    return;
  }


  // ----- [4b] Copy Pre-Compiled Theme ----------------------------------------

  if (themeDescriptor.type === 'precompiled') {
    await fs.move(absThemeSrcPath, absThemeOutPath);
    log.verbose('compile', `Copied theme ${chalk.blue(parsedThemeLabel)} ${chalk.dim('(pre-compiled)')}.`);
    return;
  }
}


/**
 * Responsible re-compiling each theme defined in the user's configuration file.
 */
export default async function compile({/* args, */config, root, json}: CLIHandlerOptions) {
  const absOutDir = path.resolve(root, config.outDir);
  log.verbose('compile', `Themes will be compiled to ${chalk.green(absOutDir)}.`);

  let compilationHasErrors = false;

  await Promise.all(config.themes.map(async themeDescriptor => {
    try {
      return await compileThemeToJson({absBaseDir: root, absOutDir, json, themeDescriptor});
    } catch (err) {
      log.error('compile', err.message);
      compilationHasErrors = true;
    }
  }));

  if (compilationHasErrors) {
    throw new Error('Compilation finished with errors.');
  }

  return;
}
