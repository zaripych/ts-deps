// @ts-check
import { join } from 'path';
import { ROOT, sortedDirectoryContents } from './helpers';
import { defaults } from '../defaults';
import { babelBuild } from '../scripts';

jest.setTimeout(120000);

describe('babelBuild', () => {
  it('should work', async () => {
    await babelBuild({
      // We should not use command line arguments from the
      // jest test framework
      commandLine: ['-s'],
    });

    const buildFiles = await sortedDirectoryContents(
      join(ROOT, defaults.libOutDir)
    );

    expect(buildFiles).toMatchSnapshot();
  });
});
