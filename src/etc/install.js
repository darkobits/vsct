#!/usr/bin/env node

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');


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
  const manifest = require(path.join(__dirname, 'package.json'));

  // The 'vsct dev' command handler will invoke this script with the VSCT_DEV
  // environment variable set.
  // const isDev = process.env.VSCT_DEV === 'true';
  const vsCodeExtensionsDir = path.join(os.homedir(), '.vscode', 'extensions');
  const { name } = parsePackageName(manifest.name);
  const extensionDirname = `${manifest.publisher}.${name}`;

  // 1. Ensure extensions directory exists.
  try {
    await fs.access(vsCodeExtensionsDir, fs.constants.R_OK);
  } catch {
    console.error('Error: VS Code does not appear to be installed on your system.');
    process.exit(1);
  }

  // 2. Ensure the extensions directory is writable.
  try {
    await fs.access(vsCodeExtensionsDir, fs.constants.W_OK);
  } catch {
    console.error('Error: Unable to write to the VS Code extensions directory.\nAdministrator permissions may be required.');
    process.exit(1);
  }

  // 3. Remove existing symlink if one exists.
  try {
    await fs.unlink(path.join(vsCodeExtensionsDir, extensionDirname));
  } catch (err) {
    // Ignore ENOENT errors; there was no symlink to delete.
    if (err.code !== 'ENOENT') {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }

  // 4. Symlink from the extensions directory to this script's directory.
  try {
    await fs.symlink(__dirname, path.join(vsCodeExtensionsDir, extensionDirname), 'junction');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  // 5. Force an update of extensions.json on the next window reload.
  try {
    await fs.unlink(path.join(vsCodeExtensionsDir, 'extensions.json'));
  } catch (err) {
    // Ignore ENOENT errors; there was no symlink to delete.
    if (err.code !== 'ENOENT') {
      console.error(`Error refreshing extensions.json: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`Installed extension: ${manifest.displayName}`);
}


void install();
