import path from 'path';

import fs from 'fs-extra';
import { temporaryDirectory } from 'tempy';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Arguments } from 'yargs';

import compile from './compile';


describe('compile', () => {
  const ROOT_DIR = temporaryDirectory();

  const args = {} as Arguments;
  const THEME_NAME = 'theme-name';
  const THEME_LABEL = 'Theme Label';
  const AUTHOR_NAME = 'Author Name';
  const THEME_VERSION = '1.2.3';
  const OUT_DIR = 'output';
  const THEME_PATH = './theme-entrypoint.js';

  beforeAll(async () => {
    // Write a mock entrypoint for the theme.
    await fs.writeFile(path.join(ROOT_DIR, THEME_PATH), `
      export default {
        label: "${THEME_LABEL}",
        foo: 'bar',
        '__THEME_MODULE__': true
      }
    `);

    // Write a mock package.json for the theme.
    await fs.writeJSON(path.join(ROOT_DIR, 'package.json'), {
      name: THEME_NAME,
      version: THEME_VERSION,
      author: {
        name: AUTHOR_NAME
      }
    });
  });

  it('should compile each theme in the provided configuration object', async () => {
    // Mock vsct.config.js that would have been loaded/parsed by the CLI.
    const config = {
      displayName: THEME_NAME,
      outDir: OUT_DIR,
      themes: [
        {
          label: THEME_LABEL,
          path: THEME_PATH
        }
      ]
    } as any;

    await compile({ args, config, root: ROOT_DIR });

    const manifestContents = await fs.readJSON(path.join(ROOT_DIR, OUT_DIR, 'package.json'));

    expect(manifestContents).toMatchObject({
      name: THEME_NAME,
      displayName: THEME_NAME,
      version: THEME_VERSION,
      publisher: AUTHOR_NAME,
      categories: ['Themes'],
      scripts: {
        postinstall: 'node install.js'
      },
      contributes: {
        themes: [
          {
            label: THEME_LABEL
          }
        ]
      }
    });

    const themeContents = await fs.readJSON(
      path.join(ROOT_DIR, OUT_DIR, manifestContents.contributes.themes[0].path)
    );

    expect(themeContents).toMatchObject({
      label: THEME_LABEL
    });

    expect(async () => {
      await fs.access(path.join(ROOT_DIR, OUT_DIR, 'install.js'), fs.constants.X_OK);
    }).not.toThrow();
  });

  afterAll(async () => {
    await fs.remove(ROOT_DIR);
  });
});
