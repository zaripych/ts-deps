// @ts-check
const { existsSync } = require('fs')
const { resolve } = require('path')
const { optionsFileName } = require('./defaults')

/**
 * @type {IOptions | null}
 */
let opts = null

/**
 * @returns {IOptions}
 */
function options() {
  if (opts) {
    return opts
  }
  const path = resolve(optionsFileName)
  const exists = existsSync(path)

  if (exists) {
    return (opts = require(path))
  } else {
    return {}
  }
}

module.exports = {
  options,
}
