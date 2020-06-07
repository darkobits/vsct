import path from 'path';
import fs from 'fs-extra';
import {Arguments} from 'yargs';

import {toDirectoryName} from 'lib/misc';
import install from './install';


jest.mock('fs-extra', () => {
  let pathExistsReturnValue = true;
  let realpathReturnValue = '';

  return {
    pathExists: jest.fn(() => pathExistsReturnValue),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _setPathExistsReturnValue: (value: any) => {
      pathExistsReturnValue = value;
    },
    realpath: jest.fn(() => realpathReturnValue),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _setRealpathReturnValue: (value: any) => {
      realpathReturnValue = value;
    },
    ensureSymlink: jest.fn(),
    unlink: jest.fn()
  };
});

jest.mock('etc/constants', () => {
  return {
    EXTENSIONS_DIR: '/mock/vscode/extensions'
  };
});


describe('install', () => {
  const args = {} as Arguments;
  const AUTHOR_NAME = '__AUTHOR_NAME__';
  const THEME_NAME = '__THEME_NAME__';
  const OUT_DIR = '__OUT_DIR__';
  const ROOT_DIR = path.join('/root', 'theme', 'dir');
  const THEME_PATH = './__THEME_MODULE__.js';

  const config = {
    outDir: OUT_DIR,
    themes: [
      {
        label: 'Muh Theme',
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

  const THEME_INSTALLATION_PATH = path.join('/mock/vscode/extensions', toDirectoryName(`${AUTHOR_NAME}.${THEME_NAME}`));

  describe('when the target symlink already exists', () => {
    describe('and it points to the desired target location', () => {
      beforeEach(() => {
        // @ts-ignore
        fs._setPathExistsReturnValue(true);
        // @ts-ignore
        fs._setRealpathReturnValue(path.join(ROOT_DIR, OUT_DIR));
      });

      it('should no-op', async () => {
        await install({args, config, json, root: ROOT_DIR});

        expect(fs.pathExists).toHaveBeenCalledWith(THEME_INSTALLATION_PATH);
        expect(fs.ensureSymlink).not.toHaveBeenCalled();
        expect(fs.unlink).not.toHaveBeenCalled();
      });
    });

    describe('but it points to a location other than the target', () => {
      beforeEach(() => {
        // @ts-ignore
        fs._setPathExistsReturnValue(true);
        // @ts-ignore
        fs._setRealpathReturnValue(path.join('/mock/vscode/extensions', 'some-other-target'));
      });

      it('should overwrite the symlink', async () => {
        await install({args, config, json, root: ROOT_DIR});

        expect(fs.pathExists).toHaveBeenCalledWith(THEME_INSTALLATION_PATH);
        expect(fs.realpath).toHaveBeenCalledWith(THEME_INSTALLATION_PATH);
        expect(fs.unlink).toHaveBeenCalledWith(THEME_INSTALLATION_PATH);
        expect(fs.ensureSymlink).toHaveBeenCalledWith(path.join(ROOT_DIR, OUT_DIR), THEME_INSTALLATION_PATH);
      });
    });
  });

  describe('when the target symlink does not exist', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      // @ts-ignore
      fs._setPathExistsReturnValue(false);
      // @ts-ignore
      fs._setRealpathReturnValue('');
    });

    it('should symlink each theme in the hosts configuration file', async () => {
      await install({args, config, json, root: ROOT_DIR});

      expect(fs.pathExists).toHaveBeenCalledWith(THEME_INSTALLATION_PATH);
      expect(fs.realpath).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(fs.ensureSymlink).toHaveBeenCalledWith(path.join(ROOT_DIR, OUT_DIR), THEME_INSTALLATION_PATH);
    });
  });
});
