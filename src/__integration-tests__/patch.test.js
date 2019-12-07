// @ts-check
import {
  ROOT,
  emptyDirSafe,
  spawnAndCheck,
  sortedDirectoryContents,
} from './helpers';
import { join } from 'path';
import { ensureDir, copy } from 'fs-extra';
import { patch } from '../scripts';

jest.setTimeout(2 * 60 * 1000);

describe('patch', () => {
  describe('given fresh directory after init', () => {
    const initDir = join(ROOT, 'integration-test-patch');

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

    it('should output correct files', async () => {
      await patch({
        forceOverwrites: true,
        patchOnly: [],
        cwd: initDir,
      });

      const contents = await sortedDirectoryContents(initDir, [
        '**',
        '!node_modules/**',
      ]);

      expect(contents).toMatchSnapshot();
    });
  });
});
