// @ts-check
const { resolve, extname, join } = require('path')
const { readFile, writeFile, pathExists } = require('fs-extra')
const { format, resolveConfig } = require('prettier')
const deepmerge = require('deepmerge')
const { tsConfig } = require('../config/tsconfig')
const { resolveTemplatesDir, promptForOverwrite } = require('../helpers')
const { options } = require('../options')
const yargs = require('yargs')

const PKG_JSON = 'package.json'

/**
 * @param {{templatesDir: string, toPatch: string|undefined }} param0
 */
const patchPackageJson = async ({ toPatch, templatesDir }) => {
  const tsDepsPackageJsonPath = join(__dirname, '../../package.json')
  const sourcePackageJsonPath = join(templatesDir, 'to-process', 'package.json')

  const tsDepsPkg = JSON.parse(
    await readFile(tsDepsPackageJsonPath, { encoding: 'utf-8' })
  )
  const sourcePkg = JSON.parse(
    await readFile(sourcePackageJsonPath, { encoding: 'utf-8' })
  )
  const targetPkg = (toPatch && JSON.parse(toPatch)) || {}

  const result = deepmerge(targetPkg, sourcePkg, {
    arrayMerge: (_target, source) => source,
  })

  if (result.dependencies) {
    for (const pkgKey of Object.keys(targetPkg.dependencies)) {
      if (tsDepsPkg.dependencies[pkgKey]) {
        result.dependencies[pkgKey] = tsDepsPkg.dependencies[pkgKey]
      }
    }
  }
  if (result.devDependencies) {
    for (const pkgKey of Object.keys(targetPkg.devDependencies)) {
      if (tsDepsPkg.dependencies[pkgKey]) {
        delete result.devDependencies[pkgKey]
      }
    }
  }

  result.devDependencies[tsDepsPkg.name] = tsDepsPkg.version

  /**
   * @type Promise<string>
   */
  return JSON.stringify(result)
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
 * @param {{ toPatch: string|undefined, baseTsConfigLocation: string | undefined}} param0
 */
const patchTsConfig = async ({ baseTsConfigLocation, toPatch }) => {
  const oldConfig = (toPatch && JSON.parse(toPatch)) || {}

  const config = tsConfig({
    ...(baseTsConfigLocation && {
      baseConfigLocation: baseTsConfigLocation,
    }),
  })

  const result = deepmerge(oldConfig, config, {
    arrayMerge: (_target, source) => source,
  })

  return JSON.stringify(result)
}

/**
 * @param {PatchParams} paramsRaw
 */
const patch = async (paramsRaw = {}) => {
  const {
    templatesDir = resolveTemplatesDir(),
    shouldPromptToOverwritePackageJson = true,
    forceOverwrites = false,
    baseTsConfigLocation,
    patchOnly,
  } = {
    /**
     * @type {Array<string>}
     */
    patchOnly: [],
    ...options(),
    ...paramsRaw,
  }
  const patchers = [
    {
      file: 'tsconfig.json',
      /**
       * @param {string|undefined} toPatch
       */
      contents: async toPatch =>
        await patchTsConfig({ toPatch, baseTsConfigLocation }),
    },
    {
      file: PKG_JSON,
      /**
       * @param {string|undefined} toPatch
       */
      contents: async toPatch =>
        await patchPackageJson({ toPatch, templatesDir }),
    },
  ]

  const config = await resolveConfig('./package.json')

  for (const item of patchers) {
    if (Array.isArray(patchOnly) && patchOnly.length > 0) {
      if (!patchOnly.includes(item.file)) {
        continue
      }
    }

    const fullPath = resolve(item.file)

    const ext = extname(fullPath)

    const oldContents = await readFile(fullPath, { encoding: 'utf-8' }).catch(
      () => Promise.resolve(undefined)
    )

    const newContents = format(await item.contents(oldContents), {
      ...config,
      ...(ext === '.json' && { parser: 'json' }),
    })

    const prompt = async () => {
      if (forceOverwrites) {
        return true
      }

      if (item.file === PKG_JSON) {
        return shouldPromptToOverwritePackageJson
          ? promptForOverwriteBeforePatch(fullPath)
          : true
      } else {
        return promptForOverwriteBeforePatch(fullPath)
      }
    }

    if (oldContents !== newContents) {
      const shouldPatch = await prompt()

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

/**
 * @param {import('yargs').Arguments} args
 */
async function patchHandler(args) {
  await patch({
    ...(typeof args.interactive === 'boolean' && {
      forceOverwrites: !args.interactive,
    }),
    ...(typeof args.only === 'string' && {
      patchOnly: [args.only],
    }),
    ...(typeof args.only !== 'string' &&
      Array.isArray(args.only) && {
        patchOnly: args.only,
      }),
  })
}

const patchCliModule = {
  command: ['patch'],
  /**
   * @param {import('yargs').Argv} y
   */
  builder: y =>
    y
      .boolean('interactive')
      .alias('i', 'interactive')
      .describe('interactive', 'Prompt to patch for every existing file')
      .default('interactive', false)
      .array('only')
      .describe('only', 'Patch only selected files')
      .example(
        '$0 patch --force',
        'Patch all files, do not ask to overwrite files'
      )
      .example(
        '$0 patch --only tsconfig.json',
        'Patch only tsconfig.json, ask to overwrite if exists'
      ),
  /**
   * @param {import('yargs').Arguments} args
   */
  handler: patchHandler,
  describe:
    'Patch tsconfig.json and/or package.json files after changes from ts-deps.config.js or after ts-deps upgrade',
}

async function patchCli() {
  const args = patchCliModule.builder(yargs).parse()
  await patchHandler(args)
}

module.exports = {
  patch,
  patchCli,
  patchCliModule,
}
