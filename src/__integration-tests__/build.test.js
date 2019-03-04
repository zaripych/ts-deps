// @ts-check
import { join } from 'path'
import { ROOT, sortedDirectoryContents } from './helpers'
const { babelBuild } = require('../scripts')

jest.setTimeout(120000)

describe('build', () => {
  it('should work', async () => {
    await babelBuild()

    const buildFiles = await sortedDirectoryContents(join(ROOT, 'lib'))

    expect(buildFiles).toMatchSnapshot()
  })
})
