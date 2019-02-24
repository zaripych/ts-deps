// @ts-check
const { emptyDir, rmdir, existsSync } = require('fs-extra')
const { resolve, join } = require('path')

const clean = async () => {
  const currentDir = resolve('./')

  const packageJson = join(currentDir, 'package.json')

  if (existsSync(packageJson)) {
    const libPath = join(currentDir, './lib')
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
