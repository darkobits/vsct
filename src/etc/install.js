#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const manifest = require('./package.json');
const symlinkPath = path.join(os.homedir(), '.vscode', 'extensions');
const symlinkName = `${manifest.publisher}.${manifest.name}`;

// Ensure extensions directory exists.
try {
  fs.accessSync(symlinkPath, fs.constants.R_OK);
} catch {
  process.stderr.write('Error: VS Code does not appear to be installed on your system.\n');
  process.exit(1);
}

// Ensure the extensions directory is writable.
try {
  fs.accessSync(symlinkPath, fs.constants.W_OK);
} catch {
  process.stderr.write('Error: Unable to write to the VS Code extensions directory.\n');
  process.stderr.write('Administrator permissions may be required.\n');
  process.exit(1);
}

// Remove any existing symlink.
try {
  fs.unlinkSync(path.join(symlinkPath, symlinkName));
} catch (err) {
  // Ignore ENOENT errors; there was no symlink to delete.
  if (err.code !== 'ENOENT') {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }
}

// Symlink from the extensions directory to this script's directory.
try {
  fs.symlinkSync(__dirname, path.join(symlinkPath, symlinkName));
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
}

process.stdout.write(`Installed theme ${manifest.displayName} v${manifest.version}.\n`);
