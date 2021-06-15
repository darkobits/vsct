#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';


/**
 * @private
 *
 * Provided a valid NPM package name, returns an object containing its scope and
 * name parts.
 *
 * (Copied from utils.ts)
 */
function parsePackageName(fullName: string) {
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
 * the directory the installer resides in.
 */
function install() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const manifest = require('./package.json');
  const symlinkPath = path.join(os.homedir(), '.vscode', 'extensions');
  const { name } = parsePackageName(manifest.name);
  const symlinkName = `${manifest.publisher}.${name}`;

  // 1. Ensure extensions directory exists.
  try {
    fs.accessSync(symlinkPath, fs.constants.R_OK);
  } catch {
    process.stderr.write('Error: VS Code does not appear to be installed on your system.\n');
    process.exit(1);
  }

  // 2. Ensure the extensions directory is writable.
  try {
    fs.accessSync(symlinkPath, fs.constants.W_OK);
  } catch {
    process.stderr.write('Error: Unable to write to the VS Code extensions directory.\n');
    process.stderr.write('Administrator permissions may be required.\n');
    process.exit(1);
  }

  // 3. Remove existing symlink if one exists.
  try {
    fs.unlinkSync(path.join(symlinkPath, symlinkName));
  } catch (err) {
    // Ignore ENOENT errors; there was no symlink to delete.
    if (err.code !== 'ENOENT') {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
  }

  // 4. Symlink from the extensions directory to this script's directory.
  try {
    fs.symlinkSync(__dirname, path.join(symlinkPath, symlinkName));
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  process.stdout.write(`Installed extension: ${manifest.displayName}\n`);
}

void install();
