import execa, { ExecaChildProcess } from 'execa';
import path from 'path';

import dev from './dev';


jest.mock('fs-extra', () => {
  return {
    access: jest.fn()
  };
});

jest.mock('execa', () => {
  const execaMock = jest.fn(() => {
    const processPromise = Promise.resolve() as unknown as ExecaChildProcess;

    // @ts-expect-error
    processPromise.stdout = {
      pipe: jest.fn()
    };

    return processPromise;
  });

  return execaMock;
});


describe('install', () => {
  const root = '/__PATH_TO_HOST_ROOT__';

  const config: any = {
    outDir: '__OUT_DIR__'
  };

  it('should invoke the install script for the compiled extension in the host package', async () => {
    // @ts-expect-error
    await dev({ root, config });

    expect(execa).toHaveBeenCalledWith(path.join(root, config.outDir, 'install.js'), {
      cwd: path.join(root, config.outDir),
      stdio: 'pipe'
    });
  });
});
