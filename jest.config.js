'use strict'

const { jestConfig } = require('./src')

module.exports = jestConfig({
  isIntegrationTest: false,
})
