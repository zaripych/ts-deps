import { spawnSync } from 'child_process'
import {
  readFile,
  writeFile,
  remove,
  emptyDir,
  pathExists,
  unlink,
} from 'fs-extra'
import { resolve, join, normalize, relative, isAbsolute } from 'path'
import { format, resolveConfig } from 'prettier'

export const PKG_JSON = 'package.json'
export const ROOT = resolve(__dirname, '../../')

// - start of the archive file name after yarn pack
const ARCH_PKG_FILE_NAME = 'zaripych-ts-deps'

export const patchPackageJsonVersion = async () => {
  console.log('Modifying package json')

  const packageJsonLocation = join(ROOT, PKG_JSON)

  const packageJsonContents = await readFile(packageJsonLocation, {
    encoding: 'utf-8',
  })

  const pkg = JSON.parse(packageJsonContents) as {
    version: string
  }

  if (!/-integration-test$/.test(pkg.version)) {
    pkg.version = `${pkg.version}-integration-test`

    const config = await resolveConfig(packageJsonLocation)

    await writeFile(
      packageJsonLocation,
      format(JSON.stringify(pkg), { ...config, parser: 'json' }),
      {
        encoding: 'utf-8',
      }
    )
  }

  return pkg.version
}

export const spawnAndCheck = (
  ...args: Parameters<typeof spawnSync>
): ReturnType<typeof spawnSync> => {
  const [app, cmdOrOpts, optsOrCb] = args

  const cmd = Array.isArray(cmdOrOpts) ? cmdOrOpts : []
  const opts = Array.isArray(cmdOrOpts) ? optsOrCb : cmdOrOpts

  const effectiveOpts = {
    ...opts,
    shell: true,
    encoding: 'utf-8',
  }

  console.log(app, Array.isArray(cmd) ? cmd.join(' ') : '')

  const result = spawnSync(app, cmd, effectiveOpts)

  console.log(result.output.filter(Boolean).join(''))

  if (result.error) {
    throw result.error
  }

  if (result.status != 0) {
    throw new Error(
      `process ${args[0]} exit with non-zero status code: ${result.status}`
    )
  }

  return result
}

const checkSafety = async (dir: string) => {
  const normalized = normalize(dir)
  const relativePath = relative(ROOT, normalized)

  if (/\.\./g.test(relativePath)) {
    throw new Error(
      'We can only delete directories within the root of our package'
    )
  }

  const exists = await pathExists(normalized)
  return { exists, path: normalized }
}

export const emptyDirSafe = async (relativeToRoot: string) => {
  const { exists, path } = await checkSafety(relativeToRoot)
  if (!exists) {
    return
  }

  await emptyDir(path)
}

export const rmDirSafe = async (relativeToRoot: string) => {
  const { exists, path } = await checkSafety(relativeToRoot)
  if (!exists) {
    return
  }

  await remove(path)
}

export const buildAndPack = async () => {
  const version = await patchPackageJsonVersion()

  console.log('version', version)

  spawnAndCheck('yarn', ['build'], {
    cwd: ROOT,
    shell: true,
  })

  const packageName = `${ARCH_PKG_FILE_NAME}-v${version}.tgz`
  const packageLocation = join(ROOT, packageName)

  await unlink(packageLocation).catch(() => Promise.resolve())

  spawnAndCheck('yarn', ['pack'], {
    cwd: ROOT,
    shell: true,
  })

  return { packageName, packageLocation, version }
}

const toUnixCompatiblePath = (path: string) => {
  if (!isAbsolute(path)) {
    throw new Error('Must be absolute path')
  }
  return '/' + path.replace(/\\/g, '/').replace(':', '')
}

export const unarchiveTarGz = async (cwd: string, tar: string, out: string) => {
  spawnAndCheck(
    'tar',
    ['zxvf', tar, '--directory', toUnixCompatiblePath(out)],
    {
      encoding: 'utf-8',
      shell: true,
      cwd,
    }
  )
}

const compareStrings = (a: string, b: string) => (a === b ? 0 : a > b ? 1 : -1)

const comparePathComponents = (a: string[], b: string[]): 0 | 1 | -1 => {
  if (a.length === 0 && b.length == 0) {
    return 0
  }
  const i = compareStrings(a[0], b[0])
  if (i === 0) {
    return comparePathComponents(a.slice(1), b.slice(1))
  } else {
    return i
  }
}

const seps = /\\|\//g

const comparePaths = (a: string, b: string) => {
  const componentsA = a.split(seps)
  const componentsB = b.split(seps)
  const result = comparePathComponents(componentsA, componentsB)
  return result
}

export const sortPaths = (files: string[]) => {
  files.sort(comparePaths)
}
