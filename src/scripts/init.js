// @ts-check
const { spawnSync } = require('child_process')
const { existsSync, copy, pathExists, stat, ensureDir } = require('fs-extra')
const { resolve, join } = require('path')
const { patch } = require('./patch')
const { resolveTemplatesDir, promptForOverwrite } = require('../helpers')
const yargs = require('yargs')

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

  await copy(toCopyDir, currentDir, {
    filter: async (_src, dest) => {
      const destStats = await stat(dest).catch(() => Promise.resolve(null))
      if (destStats && destStats.isDirectory()) {
        return true
      }

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

  const directories = [
    //
    'src',
    'src/__tests__',
    'src/__integration-tests__',
  ]

  await Promise.all(
    directories
      .map(dir => join(currentDir, dir))
      .map(dir => ensureDir(dir).catch(() => Promise.resolve()))
  )
}

/**
 * @param {InitParams} param0
 */
const init = async ({ forceOverwrites = false, cwd = process.cwd() } = {}) => {
  try {
    const currentDir = resolve(cwd)
    const templatesDir = resolveTemplatesDir()

    const pkgCreated = await npmInitIfRequired()

    const copyTemplates = () =>
      copyFromTemplates({
        templatesDir,
        currentDir,
        forceOverwrites,
      })

    const generate = () =>
      patch({
        templatesDir,
        shouldPromptToOverwritePackageJson: !pkgCreated,
        forceOverwrites,
        cwd: currentDir,
        aggressive: true,
      })

    await copyTemplates()

    await generate()
  } catch (exc) {
    console.error('Sorry, but something went wrong', exc)
    process.exit(-1)
  }
}

/**
 * @param {import('yargs').Arguments<{ force: boolean }>} args
 */
async function initHandler(args) {
  await init({
    ...(typeof args.force === 'boolean' && {
      forceOverwrites: args.force,
    }),
  })
}

const initCliModule = {
  command: ['init'],
  /**
   * @param {import('yargs').Argv} y
   */
  builder: y =>
    y
      .boolean('force')
      .describe('force', 'Force overwrite/patch all files')
      .default('force', false),
  /**
   * @param {import('yargs').Arguments<{ force: boolean }>} args
   */
  handler: initHandler,
  describe:
    "Initialize new package, or integrate with existing package - the cli will ask to overwrite/patch files unless '--force' flag is passed",
}

async function initCli() {
  const args = initCliModule.builder(yargs).parse()
  await initHandler(args)
}

module.exports = {
  init,
  initCli,
  initCliModule,
}
