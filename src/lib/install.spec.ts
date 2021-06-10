import execa from 'execa';
import path from 'path';

import install from './install';


jest.mock('fs-extra', () => {
  return {
    access: jest.fn()
  };
});

jest.mock('execa', () => {
  return jest.fn();
});


describe('install', () => {
  const root = '/__PATH_TO_HOST_ROOT__';

  const config: any = {
    outDir: '__OUT_DIR__'
  };

  it('should invoke the install script for the compiled extension in the host package', async () => {
    // @ts-expect-error
    await install({ root, config });

    expect(execa).toHaveBeenCalledWith(path.join(root, config.outDir, 'install.js'), {
      cwd: path.join(root, config.outDir),
      stdio: 'inherit'
    });
  });
});
