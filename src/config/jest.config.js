// @ts-check
'use strict'

const defaults = require('../defaults')
const { options } = require('../options')

const {
  ensureStartsWithPathSeparator,
  trimPathSeparator,
} = require('../helpers')

/**
 *
 * @param {Partial<IJestConfigParams>} paramsRaw
 */
const jestConfig = (paramsRaw = {}) => {
  const opts = options()
  const { aliases, isIntegrationTest } = {
    aliases: opts.aliases,
    isIntegrationTest: false,
    ...paramsRaw,
  }
  const src = ensureStartsWithPathSeparator(defaults.rootDir)
  const lib = trimPathSeparator(defaults.outDir)
  const extensions = defaults.extensions
  const exts = defaults.extensions.join(',')
  const moduleNameMapper =
    aliases &&
    Object.keys(aliases).reduce((acc, key) => {
      const alias = trimPathSeparator(aliases[key])
      return {
        ...acc,
        [`^${key}$`]: `<rootDir>/${alias}`,
        [`^${key}/(.*)$`]: `<rootDir>/${alias}/$1`,
      }
    }, {})

  const integrationTestMatch = `<rootDir>/${
    defaults.integrationTestsGlob
  }/*.test.{${exts}}`
  const unitTestMatch = `<rootDir>/${defaults.unitTestsGlob}/*.test.{${exts}}`

  return {
    testEnvironment: 'node',
    testMatch: isIntegrationTest ? [integrationTestMatch] : [unitTestMatch],
    cacheDirectory: '.jest-cache',
    coverageDirectory: isIntegrationTest
      ? 'coverage-integration'
      : 'coverage-unit',
    coverageReporters: ['json', 'lcov', 'text'],
    collectCoverageFrom: [
      `<rootDir>${src}/**/*.{${exts}}`,
      `!**/node_modules/**`,
      `!${defaults.integrationTestsGlob}`,
      `!${defaults.unitTestsGlob}`,
      `!<rootDir>${src}/**/*.d.ts`,
      `!<rootDir>${src}/**/*.json`,
    ],
    moduleFileExtensions: extensions,
    setupFiles: [],
    ...(moduleNameMapper && { moduleNameMapper }),
    testPathIgnorePatterns: ['/node_modules/', lib],
    modulePathIgnorePatterns: [lib],
    globals: {
      INTEGRATION_TEST: false,
    },
    transformIgnorePatterns: [`.*\\.json`, `.*\\.d\\.ts`],
  }
}

module.exports = {
  jestConfig,
}
