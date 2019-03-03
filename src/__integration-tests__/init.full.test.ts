import {
  buildAndPack,
  ROOT,
  emptyDirSafe,
  spawnAndCheck,
  sortPaths,
} from './helpers'
import { join } from 'path'
import { ensureDir, copy } from 'fs-extra'
import fg from 'fast-glob'

jest.setTimeout(5 * 60 * 1000)

describe('init', () => {
  describe('given fresh directory after init', () => {
    const initDir = join(ROOT, 'integration-test-init')

    beforeAll(async () => {
      const { packageLocation } = await buildAndPack()

      await emptyDirSafe(initDir)
      await ensureDir(initDir)

      // to maky sure husky will not conflict with hooks of the main repo
      spawnAndCheck('git', ['init'], {
        cwd: initDir,
      })

      const sourceLocation = join(ROOT, 'test-sources', 'init-full')

      await copy(sourceLocation, initDir, {
        overwrite: true,
      })

      spawnAndCheck('npm', ['init', '-y'], {
        cwd: initDir,
      })

      spawnAndCheck('npm', ['add', 'file:' + packageLocation, '--save-dev'], {
        cwd: initDir,
      })

      spawnAndCheck('npx', ['ts-deps', 'init', '--force'], {
        cwd: initDir,
      })
    })

    it('should output correct files', async () => {
      const contents = await fg<string>(['**', '!node_modules/**'], {
        cwd: initDir,
        unique: true,
        markDirectories: true,
        onlyDirectories: false,
        onlyFiles: false,
      })

      sortPaths(contents)

      expect(contents).toMatchSnapshot()
    })

    it('should build and test and lint', async () => {
      spawnAndCheck('npm', ['run', 'build'], {
        cwd: initDir,
      })

      spawnAndCheck('npm', ['run', 'test'], {
        cwd: initDir,
      })

      spawnAndCheck('npm', ['run', 'type-check'], {
        cwd: initDir,
      })

      const outDir = join(initDir, 'lib')

      const libContents = await fg<string>(['**', '!node_modules/**'], {
        cwd: outDir,
        unique: true,
        markDirectories: true,
        onlyDirectories: false,
        onlyFiles: false,
      })

      sortPaths(libContents)

      expect(libContents).toMatchSnapshot()
    })
  })
})
