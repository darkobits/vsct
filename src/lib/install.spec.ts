import path from 'path';
import fs from 'fs-extra';
import {Arguments} from 'yargs';
import defaultConfig from 'etc/default-config';
import install from './install';


jest.mock('fs-extra', () => {
  let pathExistsReturnValue = true;
  let realpathReturnValue = '';

  return {
    pathExists: jest.fn(() => pathExistsReturnValue),
    _setPathExistsReturnValue: (value: any) => {
      pathExistsReturnValue = value;
    },
    realpath: jest.fn(() => realpathReturnValue),
    _setRealpathReturnValue: (value: any) => {
      realpathReturnValue = value;
    },
    symlink: jest.fn(),
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
  const ROOT_DIR = path.join('/root', 'theme', 'dir');

  const config = {
    ...defaultConfig,
    themes: [
      {
        label: 'Muh Theme',
        main: './muh-theme.js'
      }
    ]
  };

  const json = {
    name: 'muh-theme',
    version: '9000',
    author: {name: 'Author'}
  };

  describe('when the target symlink already exists', () => {
    describe('and it points to the desired target location', () => {
      beforeEach(() => {
        // @ts-ignore
        fs._setPathExistsReturnValue(true);
        // @ts-ignore
        fs._setRealpathReturnValue('/root/theme/dir/themes/muh-theme');
      });

      it('should no-op', async () => {
        await install({args, config, json, root: ROOT_DIR});

        expect(fs.pathExists).toHaveBeenCalledWith('/mock/vscode/extensions/author.muh-theme');
        expect(fs.symlink).not.toHaveBeenCalled();
        expect(fs.unlink).not.toHaveBeenCalled();
      });
    });

    describe('but it points to a location other than the target', () => {
      beforeEach(() => {
        // @ts-ignore
        fs._setPathExistsReturnValue(true);
        // @ts-ignore
        fs._setRealpathReturnValue('/root/theme/dir/themes/muh-other-theme');
      });

      it('should overwrite the symlink', async () => {
        await install({args, config, json, root: ROOT_DIR});
        expect(fs.pathExists).toHaveBeenCalledWith('/mock/vscode/extensions/author.muh-theme');
        expect(fs.realpath).toHaveBeenCalledWith('/mock/vscode/extensions/author.muh-theme');
        expect(fs.unlink).toHaveBeenCalledWith('/mock/vscode/extensions/author.muh-theme');
        expect(fs.symlink).toHaveBeenCalledWith('/root/theme/dir/themes/muh-theme', '/mock/vscode/extensions/author.muh-theme');
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
      expect(fs.pathExists).toHaveBeenCalledWith('/mock/vscode/extensions/author.muh-theme');
      expect(fs.realpath).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(fs.symlink).toHaveBeenCalledWith('/root/theme/dir/themes/muh-theme', '/mock/vscode/extensions/author.muh-theme');
    });
  });
});
