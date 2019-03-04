// @ts-check
'use strict'

const defaults = require('../defaults')
const { trimPathSeparator } = require('../helpers')
const { options } = require('../options')

/**
 * @param {Partial<IBabelConfigParams>} paramsRaw
 */
const babelConfig = (paramsRaw = {}) => {
  const opts = options()
  const { aliases, nodeVersion } = {
    aliases: opts.aliases,
    nodeVersion: opts.nodeVersion || defaults.nodeVersion,
    ...paramsRaw,
  }
  const src = defaults.rootDir

  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      !!aliases && [
        'module-resolver',
        {
          root: [src],
          alias: Object.keys(aliases).reduce((acc, key) => {
            return {
              ...acc,
              [key]: trimPathSeparator(aliases[key]),
            }
          }, {}),
        },
      ],
      '@babel/proposal-class-properties',
    ].filter(Boolean),
    ignore: [`${src}/**/*.d.ts`, `${src}/**/*.json`],
  }

  return config
}

module.exports = {
  __esModule: {
    value: true,
  },
  default: babelConfig(),
  babelConfig,
}
