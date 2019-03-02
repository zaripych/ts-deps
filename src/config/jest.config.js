// @ts-check
'use strict'

const defaults = require('../defaults')
const { options } = require('../options')

const {
  ensureStartsWithPathSeparator,
  trimPathSeparator,
} = require('../helpers')

const jestConfig = (
  { aliases, isIntegrationTest = false } = { ...options() }
) => {
  const src = ensureStartsWithPathSeparator(defaults.rootDir)
  const lib = trimPathSeparator(defaults.outDir)
  const extensions = defaults.extensions
  const exts = defaults.extensions.join(',')
  const pipedExts = defaults.extensions.join('|')
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
    collectCoverageFrom: [
      `<rootDir>${src}/**/*.{${exts}}`,
      '!**/node_modules/**',
      '!**/*.d.ts',
    ],
    moduleFileExtensions: extensions,
    setupFiles: [],
    ...(moduleNameMapper && { moduleNameMapper }),
    testPathIgnorePatterns: ['/node_modules/', lib],
    transform: {
      [`^.+\\.(${pipedExts})$`]: '<rootDir>/node_modules/babel-jest',
    },
    modulePathIgnorePatterns: [lib],
    globals: {
      INTEGRATION_TEST: false,
    },
  }
}

module.exports = {
  jestConfig,
}
