import path from 'path';

import fs from 'fs-extra';
import { temporaryDirectory } from 'tempy';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Arguments } from 'yargs';

import compile from './compile';


describe('compile', () => {
  const ROOT_DIR = temporaryDirectory();

  const args = {} as Arguments;
  const THEME_NAME = '__THEME_NAME__';
  const THEME_LABEL = '__THEME_LABEL__';
  const AUTHOR_NAME = '__AUTHOR_NAME__';
  const THEME_VERSION = '1.2.3';

  const OUT_DIR = '__OUT_DIR__';
  const THEME_PATH = './__THEME_MODULE__.js';

  beforeAll(async () => {
    await fs.writeFile(path.join(ROOT_DIR, THEME_PATH), `
      export default {
        label: "${THEME_LABEL}",
        '__THEME_MODULE__': true
      }
    `);
  });

  it('should compile each theme in the provided configuration object', async () => {
    const config = {
      displayName: THEME_NAME,
      outDir: OUT_DIR,
      themes: [
        {
          path: THEME_PATH
        }
      ]
    } as any;

    const json = {
      name: THEME_NAME,
      version: THEME_VERSION,
      author: {
        name: AUTHOR_NAME
      }
    } as any;

    await compile({ args, config, json, root: ROOT_DIR });


    const manifestContents = await fs.readJSON(path.join(ROOT_DIR, OUT_DIR, 'package.json'));

    expect(manifestContents).toMatchObject({
      name: THEME_NAME,
      displayName: THEME_NAME,
      version: THEME_VERSION,
      publisher: AUTHOR_NAME,
      categories: ['Themes'],
      scripts: {
        postinstall: 'install.js'
      },
      contributes: {
        themes: [
          {
            // label: 'undefined (Dev)',
            path: '__theme_name__-0.json'
          }
        ]
      }
    });

    // @ts-ignore
    // expect(fs.ensureDir.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, OUT_DIR));

    // // @ts-ignore
    // expect(fs.writeJson.mock.calls[1][0]).toEqual(path.join(ROOT_DIR, OUT_DIR, 'package.json'));

    // // @ts-ignore
    // expect(fs.writeJson.mock.calls[0][1]).toBeTruthy();

    // // @ts-ignore
    // expect(fs.writeJson.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, OUT_DIR, `${toDirectoryName(THEME_NAME)}-0.json`));

    // // @ts-ignore
    // expect(fs.writeJson.mock.calls[0][1]).toMatchObject({
    //   __THEME_MODULE__: true
    // });
  });

  afterAll(async () => {
    await fs.remove(ROOT_DIR);
  });
});
