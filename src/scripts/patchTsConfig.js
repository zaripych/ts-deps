// @ts-check
const { tsConfig, tsConfigDeclarations } = require('../config/tsconfig')
const deepmerge = require('deepmerge')

const defaultDeps = Object.freeze({
  tsConfig,
  tsConfigDeclarations,
})

/**
 *
 * @param {{ oldConfig: {}, baseTsConfigLocation?: string, aggressive: boolean, declarations: boolean}} param0
 */
const patchTsConfigCore = async (
  { oldConfig, baseTsConfigLocation, aggressive, declarations },
  deps = defaultDeps
) => {
  const tsParams = {
    ...(baseTsConfigLocation && {
      baseConfigLocation: baseTsConfigLocation,
    }),
  }

  const config = declarations
    ? deps.tsConfigDeclarations(tsParams)
    : deps.tsConfig(tsParams)

  const result = aggressive
    ? config
    : deepmerge(oldConfig, config, {
        arrayMerge: (_target, source) => source,
      })

  return result
}

patchTsConfigCore.defaultDeps = defaultDeps

module.exports = {
  patchTsConfigCore,
}
