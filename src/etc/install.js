#!/usr/bin/env node

import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';


const require = createRequire(import.meta.url);


/**
 * @private
 *
 * Provided a valid NPM package name, returns an object containing its scope and
 * name parts.
 *
 * (Copied from utils.ts)
 */
function parsePackageName(fullName) {
  const match = /^(?:@(?<scope>.*)\/)?(?<name>.*)$/g.exec(fullName);

  if (!match) {
    throw new Error(`Unable to parse package name: "${fullName}".`);
  }

  const { groups } = match;

  if (!groups) {
    throw new Error(`Unable to parse package name: "${fullName}".`);
  }

  return {
    scope: groups.scope,
    name: groups.name
  };
}


/**
 * This script is copied into the output directory of compiled extensions and
 * executed when the extension is installed. It ensures that VS Code is
 * installed and creates a symlink in the VS Code extensions directory back to
 * the directory where the theme (and this installer) reside.
 */
async function install() {
  const manifest = await import(require.resolve('./package.json'), { assert: { type: 'json' }});

  // The 'vsct dev' command handler will invoke this script with the VSCT_DEV
  // environment variable set.
  const isDev = process.env.VSCT_DEV === 'true';
  const vsCodeExtensionsDir = path.join(os.homedir(), '.vscode', 'extensions');
  const { name } = parsePackageName(manifest.name);

  // If being invoked by 'vsct dev', append "-dev" to the directory name so as
  // to not overwrite a production version of the same extension.
  const extensionDirname = `${manifest.publisher}.${name}${isDev ? '-dev' : ''}`;

  // 1. Ensure extensions directory exists.
  try {
    fs.accessSync(vsCodeExtensionsDir, fs.constants.R_OK);
  } catch {
    console.error('Error: VS Code does not appear to be installed on your system.');
    process.exit(1);
  }

  // 2. Ensure the extensions directory is writable.
  try {
    fs.accessSync(vsCodeExtensionsDir, fs.constants.W_OK);
  } catch {
    console.error('Error: Unable to write to the VS Code extensions directory.\nAdministrator permissions may be required.');
    process.exit(1);
  }

  // 3. Remove existing symlink if one exists.
  try {
    fs.unlinkSync(path.join(vsCodeExtensionsDir, extensionDirname));
  } catch (err) {
    // Ignore ENOENT errors; there was no symlink to delete.
    if (err.code !== 'ENOENT') {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }

  // 4. Symlink from the extensions directory to this script's directory.
  try {
    fs.symlinkSync(__dirname, path.join(vsCodeExtensionsDir, extensionDirname));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  console.log(`Installed extension: ${manifest.displayName}`);
}


void install();
