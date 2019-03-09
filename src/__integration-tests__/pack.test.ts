import { existsSync, ensureDir } from 'fs-extra';
import { join } from 'path';
import {
  buildAndPack,
  ROOT,
  unarchiveTarGz,
  emptyDirSafe,
  sortedDirectoryContents,
} from './helpers';

jest.setTimeout(120000);

describe('pack', () => {
  it('should work', async () => {
    const { packageLocation, packageName } = await buildAndPack();

    expect(existsSync(packageLocation)).toBe(true);

    const unarchiveDir = join(ROOT, 'integration-test-pkg');

    await emptyDirSafe(unarchiveDir);
    await ensureDir(unarchiveDir);

    await unarchiveTarGz(join(ROOT, packageName), unarchiveDir);

    const allPackageFiles = await sortedDirectoryContents(unarchiveDir);

    expect(allPackageFiles).toMatchSnapshot();
  });
});
