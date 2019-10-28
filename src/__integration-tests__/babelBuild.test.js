// @ts-check
import { join } from 'path';
import { ROOT, sortedDirectoryContents } from './helpers';
import defaults from '../defaults';
import { babelBuild } from '../scripts';

jest.setTimeout(120000);

describe('babelBuild', () => {
  it('should work', async () => {
    await babelBuild();

    const buildFiles = await sortedDirectoryContents(
      join(ROOT, defaults.outDir)
    );

    expect(buildFiles).toMatchSnapshot();
  });
});
