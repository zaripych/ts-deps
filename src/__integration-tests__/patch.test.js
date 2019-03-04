// @ts-check
import {
  ROOT,
  emptyDirSafe,
  spawnAndCheck,
  sortedDirectoryContents,
} from './helpers'
import { join } from 'path'
import { ensureDir, copy } from 'fs-extra'
const { patch } = require('../scripts')

jest.setTimeout(2 * 60 * 1000)

describe('patch', () => {
  describe('given fresh directory after init', () => {
    const initDir = join(ROOT, 'integration-test-patch')

    beforeAll(async () => {
      await emptyDirSafe(initDir)
      await ensureDir(initDir)

      const sourceLocation = join(ROOT, 'test-sources', 'init-full')

      await copy(sourceLocation, initDir, {
        overwrite: true,
      })

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      })

      await patch({
        forceOverwrites: true,
        cwd: initDir,
      })
    })

    it('should output correct files', async () => {
      const contents = await sortedDirectoryContents(initDir, [
        '**',
        '!node_modules/**',
      ])

      expect(contents).toMatchSnapshot()
    })
  })
})
