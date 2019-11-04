// @ts-check
import { join } from 'path';
import { ROOT, sortedDirectoryContents } from './helpers';
import defaults from '../defaults';
import { clean } from '../scripts';

jest.setTimeout(120000);

describe('clean', () => {
  it('should work', async () => {
    await clean();

    const buildFiles = await sortedDirectoryContents(
      join(ROOT, defaults.libOutDir)
    );

    expect(buildFiles).toEqual([]);

    await clean();
  });
});
