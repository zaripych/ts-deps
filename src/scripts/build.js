// @ts-check
const { spawn } = require('child_process')
const defaults = require('../defaults')

/**
 * @param {string[]} args All arguments
 * @param {string[]} lookupArgs Arguments we are interested in
 * @param {string[]} values Values to set
 */
const optionalArgBuilder = (args, lookupArgs, values) => {
  const contains = args.some(arg =>
    lookupArgs.some(lookupArg => lookupArg === arg)
  )
  // if arguments already contain one of the arguments
  // we define by default, then return an empty array
  if (contains) {
    return []
  }

  return values
    .map(val => [lookupArgs[0], val])
    .reduce((acc, item) => [...acc, ...item], [])
}

/**
 * @param {BabelBuildParams} param
 */
function babelBuild({
  overrideWithCommandLineArguments = true,
  doNotOutputTests = true,
  logCommandLine = true,
  exitOnCompletion = true,
  extensions = defaults.extensions,
  outDir = defaults.outDir,
  rootDir = defaults.rootDir,
  unitTestsGlob = defaults.unitTestsGlob,
  integrationTestsGlob = defaults.integrationTestsGlob,
} = {}) {
  const exts = extensions.map(ext => `.${ext}`).join(',')

  const args = overrideWithCommandLineArguments ? process.argv.splice(2) : []

  const isHelpNeeded =
    args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1

  /**
   * @param {string[]} lookup
   * @param {string[]} values
   */
  const optionalArg = (lookup, values) =>
    optionalArgBuilder(args, lookup, values)

  const spawnArgs = isHelpNeeded
    ? [...args]
    : [
        rootDir,
        ...optionalArg(['--out-dir'], [outDir]),
        ...optionalArg(['-s'], ['false']),
        ...optionalArg(['--extensions'], [exts]),
        ...optionalArg(
          ['--ignore'],
          doNotOutputTests ? [unitTestsGlob, integrationTestsGlob] : []
        ),
        ...args,
      ]

  if (logCommandLine) {
    console.log('babel', spawnArgs.join(' '))
  }

  const babelProc = spawn('babel', spawnArgs, {
    env: process.env,
    stdio: 'inherit',
    shell: true,
  })

  if (exitOnCompletion) {
    let childProcessExit = false

    process.on('exit', () => {
      if (childProcessExit) {
        return
      }
      babelProc.kill()
    })

    babelProc.on('exit', code => {
      childProcessExit = true
      process.exit(code)
    })
  }

  return babelProc
}

module.exports = {
  babelBuild,
}
