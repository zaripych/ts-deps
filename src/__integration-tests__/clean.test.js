// @ts-check
import { join } from 'path'
import { ROOT, sortedDirectoryContents } from './helpers'
const { clean } = require('../scripts')

jest.setTimeout(120000)

describe('clean', () => {
  it('should work', async () => {
    await clean()

    const buildFiles = await sortedDirectoryContents(join(ROOT, 'lib'))

    expect(buildFiles).toEqual([])
  })
})
