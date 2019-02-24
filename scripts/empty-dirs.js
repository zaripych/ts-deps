// @ts-check
const { emptyDirSync, existsSync } = require('fs-extra')
const { resolve, join, isAbsolute } = require('path')

const args = process.argv.slice(2)

const emptyDirs = () => {
  if (args.length === 0) {
    throw new Error('Please specify directories to empty')
  }

  const currentDir = resolve('./')

  for (const dir of args) {
    if (isAbsolute(dir)) {
      throw new Error(
        `Directory "${dir}" is absolute, only relative to package root can be specified`
      )
    }
  }

  for (const dir of args) {
    const dirPath = join(currentDir, dir)
    if (!existsSync(dirPath)) {
      continue
    }

    console.log('empty-dir: emptying', dirPath)

    emptyDirSync(dirPath)
  }
}

emptyDirs()
