import path from 'path';

import { execa, type ExecaChildProcess } from 'execa';
import { describe, it, expect, vi } from 'vitest';

import dev from './dev';


vi.mock('fs-extra', () => {
  return {
    default: {
      access: vi.fn()
    }
  };
});

vi.mock('execa', () => {
  const execaMock = vi.fn(() => {
    const processPromise = Promise.resolve() as unknown as ExecaChildProcess;

    // @ts-expect-error
    processPromise.stdout = {
      pipe: vi.fn()
    };

    return processPromise;
  });

  return {
    execa: execaMock,
    execaNode: execaMock
  };
});


describe('install', () => {
  const root = '/__PATH_TO_HOST_ROOT__';

  const config: any = {
    outDir: '__OUT_DIR__'
  };

  it('should invoke the install script for the compiled extension in the host package', async () => {
    // @ts-expect-error
    await dev({ root, config });

    expect(execa).toHaveBeenCalledWith(
      path.join('install.js'),
      {
        cwd: path.join(root, config.outDir),
        // env: {
        //   VSCT_DEV: 'true'
        // },
        stdio: 'pipe'
      }
    );
  });
});
