import path from 'path';
import fs from 'fs-extra';
import {Arguments} from 'yargs';
import defaultConfig from 'etc/default-config';
import compile from './compile';


jest.mock('fs-extra', () => {
  return {
    ensureDir: jest.fn(() => true),
    move: jest.fn(),
    pathExists: jest.fn(() => true),
    readJson: jest.fn(),
    writeJson: jest.fn()
  };
});


jest.mock('lib/misc', () => {
  return {
    generateThemeDirName: jest.fn(() => {
      return '__THEME_DIR__';
    }),
    getVsCodeVersion: jest.fn(() => {
      return '__VS_CODE_VERSION__';
    }),
    loadThemeFromModule: jest.fn(() => {
      return {
        __THEME_MODULE__: true
      };
    }),
    parseThemeLabel: jest.fn(() => {
      return '__PARSED_THEME_LABEL__';
    }),
    getUnscopedName: jest.fn()
  };
});


describe('compile', () => {
  const args = {} as Arguments;
  const ROOT_DIR = path.join('/root', 'theme', 'dir');

  it('should compile each theme in the provided configuration object', async () => {
    const config = {
      ...defaultConfig,
      themes: [
        {
          label: 'Foo Theme',
          main: './foo.js'
        }
      ]
    };

    const json = {
      name: 'foo',
      version: '9000',
      author: {name: 'Frodo'}
    };

    await compile({args, config, json, root: ROOT_DIR});

    // @ts-ignore
    expect(fs.ensureDir.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, 'themes', '__THEME_DIR__'));
    // @ts-ignore
    expect(fs.pathExists.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, 'foo.js'));
    // @ts-ignore
    expect(fs.writeJson.mock.calls[0][0]).toEqual(path.join(ROOT_DIR, 'themes', '__THEME_DIR__', 'package.json'));
    // @ts-ignore
    expect(fs.writeJson.mock.calls[0][1]).toBeTruthy();
    // @ts-ignore
    expect(fs.writeJson.mock.calls[1][0]).toEqual(path.join(ROOT_DIR, 'themes', '__THEME_DIR__', 'foo.json'));
    // @ts-ignore
    expect(fs.writeJson.mock.calls[1][1]).toEqual({
      __THEME_MODULE__: true
    });
  });
});
