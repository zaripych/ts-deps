// @ts-check
const { options } = require('../options')
const { trimPathSeparator } = require('../helpers')
const defaults = require('../defaults')

const tsConfig = (paramsRaw = {}) => {
  const { aliases, baseConfigLocation } = {
    ...options(),
    baseConfigLocation: '@zaripych/ts-deps/lib/config/tsconfig.default.json',
    ...paramsRaw,
  }
  const src = defaults.rootDir
  const lib = defaults.outDir
  const paths =
    aliases &&
    Object.keys(aliases).reduce((acc, key) => {
      const alias = trimPathSeparator(aliases[key])
      return {
        ...acc,
        [key]: [alias],
        [`${key}/*`]: [`${alias}/*`],
      }
    }, {})

  return {
    extends: baseConfigLocation,
    compilerOptions: {
      baseUrl: '.',
      paths,
      outDir: lib,
    },
    include: [src],
  }
}

module.exports = {
  tsConfig,
}
