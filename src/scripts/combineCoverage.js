// @ts-check
// @ts-ignore
const libCoverage = require('istanbul-lib-coverage')
// @ts-ignore
const { createReporter } = require('istanbul-api')
const fg = require('fast-glob')

/**
 * @param {Partial<CombineCoverageParams>} paramsRaw
 */
const combineCoverage = (paramsRaw = {}) => {
  const cwd = paramsRaw.cwd || process.cwd()

  /**
   * @type {string[]}
   */
  const filePaths = fg.sync('./coverage-*/coverage-final.json', {
    cwd,
    onlyFiles: true,
    absolute: true,
  })

  const coverageData = filePaths.map(filePath => require(filePath))

  const map = libCoverage.createCoverageMap()
  for (const data of coverageData) {
    map.merge(data)
  }

  const reporter = createReporter()
  reporter.addAll(['json', 'lcov', 'text'])
  reporter.write(map)
}

module.exports = {
  combineCoverage,
}
