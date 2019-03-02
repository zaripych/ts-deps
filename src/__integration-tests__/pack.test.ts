import { existsSync, ensureDir } from 'fs-extra'
import { join } from 'path'
import fg from 'fast-glob'
import {
  buildAndPack,
  ROOT,
  unarchiveTarGz,
  emptyDirSafe,
  sortPaths,
} from './helpers'

jest.setTimeout(120000)

describe('pack', () => {
  it('should work', async () => {
    const { packageLocation, packageName } = await buildAndPack()

    expect(existsSync(packageLocation)).toBe(true)

    const unarchiveDir = join(ROOT, 'integration-test-pkg')

    await emptyDirSafe(unarchiveDir)
    await ensureDir(unarchiveDir)

    await unarchiveTarGz(ROOT, packageName, unarchiveDir)

    const allPackageFiles = await fg<string>('**/*.*', {
      cwd: unarchiveDir,
      unique: true,
      markDirectories: true,
      onlyDirectories: false,
      onlyFiles: false,
    })

    sortPaths(allPackageFiles)

    expect(allPackageFiles).toMatchSnapshot()
  })
})
