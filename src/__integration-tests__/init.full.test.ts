import {
  buildAndPack,
  ROOT,
  emptyDirSafe,
  spawnAndCheck,
  sortedDirectoryContents,
} from './helpers';
import { join } from 'path';
import { ensureDir, copy } from 'fs-extra';
import { defaults } from '../defaults';

jest.setTimeout(5 * 60 * 1000);

describe('init', () => {
  describe('given fresh directory after init', () => {
    const initDir = join(ROOT, 'integration-test-init-full');

    beforeAll(async () => {
      const { packageLocation } = await buildAndPack();

      await emptyDirSafe(initDir);
      await ensureDir(initDir);

      // to maky sure husky will not conflict with hooks of the main repo
      spawnAndCheck('git', ['init'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      });

      const sourceLocation = join(ROOT, 'test-sources', 'init-full');

      await copy(sourceLocation, initDir, {
        overwrite: true,
      });

      spawnAndCheck('npm', ['add', 'file:' + packageLocation, '--save-dev'], {
        cwd: initDir,
      });

      spawnAndCheck('npx', ['ts-deps', 'init', '--force'], {
        cwd: initDir,
      });
    });

    it('should output correct files', async () => {
      const contents = await sortedDirectoryContents(initDir);

      expect(contents).toMatchSnapshot();
    });

    it('should build and test and lint', async () => {
      spawnAndCheck('npm', ['run', 'build'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['run', 'declarations'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['run', 'test'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['run', 'type-check'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['run', 'lint'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['run', 'check'], {
        cwd: initDir,
      });

      spawnAndCheck('npm', ['run', 'release', '--version'], {
        cwd: initDir,
      });

      // tslint:disable-next-line
      const outDir = join(initDir, defaults.libOutDir);

      const libContents = await sortedDirectoryContents(outDir);

      expect(libContents).toMatchSnapshot();

      spawnAndCheck('npm', ['run', 'clean'], {
        cwd: initDir,
      });
    });

    describe('given changes to ts-deps config', () => {
      beforeAll(async () => {
        const sourceLocation = join(ROOT, 'test-sources', 'init-full-patch');

        await copy(sourceLocation, initDir, {
          overwrite: true,
        });

        spawnAndCheck('npx', ['ts-deps', 'patch'], {
          cwd: initDir,
        });
      });

      it('should patch', () => {
        return;
      });
    });
  });
});
