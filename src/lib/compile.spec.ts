import path from 'path';

import fs from 'fs-extra';
import { describe, it, expect, vi } from 'vitest';
import { Arguments } from 'yargs';

import { toDirectoryName } from 'lib/utils';

import compile from './compile';


vi.mock('fs-extra', () => {
  return {
    default: {
      access: vi.fn(() => true),
      ensureDir: vi.fn(() => true),
      move: vi.fn(),
      copyFile: vi.fn(),
      pathExists: vi.fn(() => true),
      readJson: vi.fn(),
      writeJson: vi.fn(),
      remove: vi.fn()
    }
  };
});

vi.mock('@darkobits/import-unique', () => {
  return {
    default: (path: string) => {
      // Return a theme module mock.
      if (path.includes('__THEME_MODULE__')) {
        return {
          label: 'Theme Module',
          '__THEME_MODULE__': true
        };
      }

      throw new Error(`Mock for @darkobits/import-unique has no handler for path: ${path}`);
    }
  };
});


describe('compile', () => {
  const args = {} as Arguments;
  const AUTHOR_NAME = '__AUTHOR_NAME__';
  const THEME_NAME = '__THEME_NAME__';
  const OUT_DIR = '__OUT_DIR__';
  const ROOT_DIR = path.join('/root', 'theme', 'dir');
  const THEME_PATH = './__THEME_MODULE__.js';

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
      version: '9000',
      author: {
        name: AUTHOR_NAME
      }
    } as any;

    await compile({args, config, json, root: ROOT_DIR});

    // @ts-ignore
    expect(fs.ensureDir.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, OUT_DIR));

    // @ts-ignore
    expect(fs.writeJson.mock.calls[1][0]).toEqual(path.join(ROOT_DIR, OUT_DIR, 'package.json'));

    // @ts-ignore
    expect(fs.writeJson.mock.calls[0][1]).toBeTruthy();

    // @ts-ignore
    expect(fs.writeJson.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, OUT_DIR, `${toDirectoryName(THEME_NAME)}-0.json`));

    // @ts-ignore
    expect(fs.writeJson.mock.calls[0][1]).toMatchObject({
      __THEME_MODULE__: true
    });
  });
});
