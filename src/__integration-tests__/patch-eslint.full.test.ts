import {
  buildAndPack,
  ROOT,
  emptyDirSafe,
  spawnAndCheck,
  sortedDirectoryContents,
} from './helpers';
import { join } from 'path';
import { ensureDir, copy } from 'fs-extra';

jest.setTimeout(5 * 60 * 1000);

describe('init', () => {
  describe('given fresh directory after init', () => {
    const initDir = join(ROOT, 'integration-test-init-full-eslint');

    beforeAll(async () => {
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

      spawnAndCheck('npm', ['add', 'ts-deps@0.12.8', '--save-dev'], {
        cwd: initDir,
      });

      spawnAndCheck('npx', ['ts-deps@0.12.8', 'init', '--force'], {
        cwd: initDir,
      });
    });

    it('should init with correct files', async () => {
      const contents = await sortedDirectoryContents(initDir);

      expect(contents).toMatchSnapshot();

      expect(contents).toContain('tslint.json');
      expect(contents).not.toContain('.eslintignore');
      expect(contents).not.toContain('.eslintrc.js');
    });

    describe('when upgraded', () => {
      beforeAll(async () => {
        const { packageLocation } = await buildAndPack();

        spawnAndCheck('npm', ['remove', 'ts-deps', '--save-dev'], {
          cwd: initDir,
        });

        spawnAndCheck('npm', ['add', 'file:' + packageLocation, '--save-dev'], {
          cwd: initDir,
        });

        spawnAndCheck('npm', ['run', 'patch'], {
          cwd: initDir,
        });
      });

      it('should patch correctly', async () => {
        const contents = await sortedDirectoryContents(initDir);

        expect(contents).toMatchSnapshot();
        expect(contents).not.toContain('tslint.json');
        expect(contents).toContain('.eslintignore');
        expect(contents).toContain('.eslintrc.js');
      });

      it('should lint', () => {
        spawnAndCheck('npm', ['run', 'lint'], {
          cwd: initDir,
        });
      });
    });
  });
});
