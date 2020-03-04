// @ts-check
import { existsSync } from 'fs';
import { resolve } from 'path';
import { defaults } from './defaults';

/**
 * @type {Options | null}
 */
let opts = null;

/**
 * @param {string|undefined} cwd
 * @returns {Options}
 */
function options(cwd = process.cwd()) {
  if (opts) {
    return opts;
  }

  const path = resolve(cwd, defaults.optionsFileName);

  const exists = existsSync(path);

  if (exists) {
    opts = require(path);
  } else {
    opts = {};
  }

  return opts || {};
}

export { options };
