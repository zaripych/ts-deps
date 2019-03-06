// @ts-check
const { emptyDir, rmdir, existsSync } = require('fs-extra')
const { join } = require('path')
const defaults = require('../defaults')

const clean = async ({ cwd = process.cwd() } = {}) => {
  const packageJson = join(cwd, 'package.json')

  if (existsSync(packageJson)) {
    const libPath = join(cwd, defaults.outDir)
    if (!existsSync(libPath)) {
      console.log('clean: nothing to clean')
      return
    }

    console.log('clean: deleting', libPath)

    await emptyDir(libPath)
    await rmdir(libPath)
  } else {
    console.log(
      'clean: no package.json found, is your current directory correct?'
    )
    process.exit(-1)
  }
}

module.exports = {
  clean,
}
