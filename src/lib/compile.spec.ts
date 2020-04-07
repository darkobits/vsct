import path from 'path';
import fs from 'fs-extra';
import {Arguments} from 'yargs';
import {toDirectoryName} from 'lib/misc';
import compile from './compile';


jest.mock('fs-extra', () => {
  return {
    access: jest.fn(() => true),
    ensureDir: jest.fn(() => true),
    move: jest.fn(),
    copyFile: jest.fn(),
    pathExists: jest.fn(() => true),
    readJson: jest.fn(),
    writeJson: jest.fn(),
    remove: jest.fn()
  };
});

jest.mock('@darkobits/import-unique', () => {
  return () => {
    return {
      __THEME_MODULE__: {}
    };
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
      outDir: OUT_DIR,
      themes: [
        {
          label: 'FooBLUE Theme',
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
    expect(fs.writeJson.mock.calls[0][1]).toEqual({
      __THEME_MODULE__: {}
    });
  });
});
