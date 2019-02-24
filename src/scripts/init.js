// @ts-check
const { spawnSync } = require('child_process')
const { existsSync, copy, pathExists } = require('fs-extra')
const { resolve, join } = require('path')
const { patch } = require('./patch')
const { resolveTemplatesDir, promptForOverwrite } = require('../helpers')

const PCG_JSON = 'package.json'

const npmInitIfRequired = async () => {
  const packageJsonPath = resolve(PCG_JSON)

  const exists = await pathExists(packageJsonPath)
  if (exists) {
    return false
  }

  const initProcessResult = spawnSync('npm', ['init'], {
    stdio: 'inherit',
    encoding: 'utf-8',
    shell: true,
  })

  if (initProcessResult.status !== 0) {
    process.exit(initProcessResult.status)
  }

  if (!existsSync(packageJsonPath)) {
    process.exit(0)
  }

  return true
}

/**
 * @param {{ templatesDir: string, currentDir: string, forceOverwrites: boolean }} param0
 */
const copyFromTemplates = async ({
  templatesDir,
  currentDir,
  forceOverwrites,
}) => {
  const toCopyDir = join(templatesDir, 'to-copy')

  return await copy(toCopyDir, currentDir, {
    filter: (_src, dest) => {
      if (dest !== currentDir) {
        console.log('init: writing', dest)
      }

      if (
        dest === currentDir ||
        forceOverwrites ||
        promptForOverwrite.state.overwriteAll
      ) {
        return Promise.resolve(true)
      }

      return pathExists(dest).then(exists =>
        exists ? promptForOverwrite(dest) : Promise.resolve(true)
      )
    },
    overwrite: true,
  })
}

const init = async ({ forceOverwrites = false } = {}) => {
  try {
    const currentDir = resolve('./')
    const templatesDir = resolveTemplatesDir()

    const pkgCreated = await npmInitIfRequired()

    const copy = () =>
      copyFromTemplates({
        templatesDir,
        currentDir,
        forceOverwrites,
      })

    const generate = () => {
      patch({
        templatesDir,
        shouldPromptToOverwritePackageJson: !pkgCreated,
        forceOverwrites,
      })
    }

    await copy()

    await generate()
  } catch (exc) {
    console.error('Something went wrong', exc)
    process.exit(-1)
  }
}

module.exports = {
  init,
}
