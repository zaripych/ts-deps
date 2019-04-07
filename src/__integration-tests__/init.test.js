// @ts-check
import {
  ROOT,
  emptyDirSafe,
  spawnAndCheck,
  sortedDirectoryContents,
} from './helpers';
import { join } from 'path';
import { ensureDir, copy } from 'fs-extra';
const { init } = require('../scripts');

jest.setTimeout(2 * 60 * 1000);

describe('init', () => {
  describe('given bare directory after init (init-bare)', () => {
    const initDir = join(ROOT, 'integration-test-init-bare');

    beforeAll(async () => {
      await emptyDirSafe(initDir);
      await ensureDir(initDir);

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      });
    });

    it('should output correct files', async () => {
      await init({
        cwd: initDir,
      });

      const contents = await sortedDirectoryContents(initDir, [
        '**',
        '!node_modules/**',
        '!.git/**',
      ]);

      expect(contents).toMatchSnapshot();
    });
  });

  describe('given non-empty directory after init, without .git (init-no-git)', () => {
    const initDir = join(ROOT, 'integration-test-init-no-git');

    beforeAll(async () => {
      await emptyDirSafe(initDir);
      await ensureDir(initDir);

      const sourceLocation = join(ROOT, 'test-sources', 'init-full');

      await copy(sourceLocation, initDir, {
        overwrite: true,
      });

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      });
    });

    it('should fail with warning', async () => {
      const initResult = init({
        cwd: initDir,
      });

      await expect(initResult).rejects.toThrow();
    });
  });

  describe('given non-empty directory after init (init-non-empty)', () => {
    const initDir = join(ROOT, 'integration-test-init-non-empty');

    beforeAll(async () => {
      await emptyDirSafe(initDir);
      await ensureDir(initDir);

      const sourceLocation = join(ROOT, 'test-sources', 'init-full');

      await copy(sourceLocation, initDir, {
        overwrite: true,
      });

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      });

      spawnAndCheck('git', ['init'], {
        cwd: initDir,
      });

      spawnAndCheck('git', ['add', '.'], {
        cwd: initDir,
      });
    });

    it('should output correct files', async () => {
      await init({
        cwd: initDir,
      });

      const contents = await sortedDirectoryContents(initDir, [
        '**',
        '!node_modules/**',
        '!.git/**',
      ]);

      expect(contents).toMatchSnapshot();
    });
  });

  describe('given non-empty directory after init, with template parameter (init-template-package)', () => {
    const initDir = join(ROOT, 'integration-test-init-template-package');

    beforeAll(async () => {
      await emptyDirSafe(initDir);
      await ensureDir(initDir);

      const sourceLocation = join(ROOT, 'test-sources', 'init-full');

      await copy(sourceLocation, initDir, {
        overwrite: true,
      });

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      });

      spawnAndCheck('git', ['init'], {
        cwd: initDir,
      });

      spawnAndCheck('git', ['add', '.'], {
        cwd: initDir,
      });
    });

    it('should output correct files', async () => {
      await init({
        template: 'ts-deps@0.2.5',
        cwd: initDir,
      });

      const contents = await sortedDirectoryContents(initDir, [
        '**',
        '!node_modules/**',
        '!.git/**',
      ]);

      expect(contents).toMatchSnapshot();
    });
  });

  describe('given non-empty directory after init, with template parameter (init-template-dir)', () => {
    const initDir = join(ROOT, 'integration-test-init-template-dir');

    beforeAll(async () => {
      await emptyDirSafe(initDir);
      await ensureDir(initDir);

      const sourceLocation = join(ROOT, 'test-sources', 'init-full');

      await copy(sourceLocation, initDir, {
        overwrite: true,
      });

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      });

      spawnAndCheck('git', ['init'], {
        cwd: initDir,
      });

      spawnAndCheck('git', ['add', '.'], {
        cwd: initDir,
      });
    });

    it('should output correct files', async () => {
      await init({
        template: '../template-test',
        cwd: initDir,
      });

      const contents = await sortedDirectoryContents(initDir, [
        '**',
        '!node_modules/**',
        '!.git/**',
      ]);

      expect(contents).toMatchSnapshot();
    });
  });
});
