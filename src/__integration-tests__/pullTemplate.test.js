// @ts-check
import { ROOT, emptyDirSafe, sortedDirectoryContents } from './helpers';
import { join } from 'path';
import { ensureDir } from 'fs-extra';
import { npmPullTemplate } from '../helpers';

describe('npmPullTemplate', () => {
  describe('given fresh directory', () => {
    const pullDir = join(ROOT, 'integration-test-pull-template');

    beforeAll(async () => {
      await emptyDirSafe(pullDir);
      await ensureDir(pullDir);
    });

    it('should output correct files', async () => {
      const template = await npmPullTemplate('ts-deps@0.2.5', pullDir, pullDir);

      // for backward compatibility
      expect(template).toBe('template-max');

      const contents = await sortedDirectoryContents(join(pullDir, template));

      expect(contents).toMatchSnapshot();
    });
  });
});
