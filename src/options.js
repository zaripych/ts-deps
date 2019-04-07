// @ts-check
const { existsSync } = require('fs');
const { resolve } = require('path');
const { optionsFileName } = require('./defaults');

/**
 * @type {IOptions | null}
 */
let opts = null;

/**
 * @param {string|undefined} cwd
 * @returns {IOptions}
 */
function options(cwd = process.cwd()) {
  if (opts) {
    return opts;
  }

  const path = resolve(cwd, optionsFileName);

  const exists = existsSync(path);

  if (exists) {
    opts = require(path);
  } else {
    opts = {};
  }

  return opts || {};
}

module.exports = {
  options,
};
