// @ts-check
const { resolve, extname, join } = require('path')
const { readFile, writeFile, pathExists } = require('fs-extra')
const { format } = require('prettier')
const deepmerge = require('deepmerge')
const { tsConfig } = require('../config/tsconfig')
const { resolveTemplatesDir, promptForOverwrite } = require('../helpers')

const PKG_JSON = 'package.json'

/**
 * @param {{templatesDir: string}} param0
 */
const patchPackageJson = async ({ templatesDir }) => {
  const sourcePackageJsonPath = join(templatesDir, 'to-process', 'package.json')
  const targetPackageJsonPath = resolve(PKG_JSON)

  const sourcePkg = JSON.parse(
    await readFile(sourcePackageJsonPath, { encoding: 'utf-8' })
  )
  const targetPkg = JSON.parse(
    await readFile(targetPackageJsonPath, { encoding: 'utf-8' })
  )

  const result = deepmerge(targetPkg, sourcePkg, {
    arrayMerge: (_target, source) => source,
  })

  /**
   * @type Promise<{}>
   */
  return result
}

/**
 * @param {string} dest
 */
const promptForOverwriteBeforePatch = async dest => {
  return pathExists(dest).then(exists =>
    exists ? promptForOverwrite(dest) : Promise.resolve(true)
  )
}

/**
 *
 * @param {{ templatesDir?: string, filter?: (dest: string) => Promise<boolean> }} param0
 */
const patch = async ({
  templatesDir = resolveTemplatesDir(),
  filter = promptForOverwriteBeforePatch,
} = {}) => {
  const patchers = [
    {
      file: 'tsconfig.json',
      contents: async () => JSON.stringify(tsConfig()),
    },
    {
      file: 'package.json',
      contents: async () =>
        JSON.stringify(await patchPackageJson({ templatesDir })),
    },
  ]

  for (const item of patchers) {
    const fullPath = resolve(item.file)

    const ext = extname(fullPath)

    const oldContents = await readFile(fullPath, { encoding: 'utf-8' }).catch(
      () => Promise.resolve('')
    )

    const newContents = format(await item.contents(), {
      ...(ext === '.json' && { parser: 'json' }),
    })

    if (oldContents !== newContents) {
      const effectiveFilter = filter || (_dest => Promise.resolve(true))

      const shouldPatch = await effectiveFilter(fullPath)

      if (!shouldPatch) {
        console.log('patch: skipping', fullPath)
        continue
      }

      console.log('patch: patching', fullPath)

      await writeFile(fullPath, newContents, {
        encoding: 'utf-8',
      })
    } else {
      console.log('patch: no changes to', fullPath)
    }
  }
}

module.exports = {
  patch,
}
