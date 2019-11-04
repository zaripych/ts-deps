// @ts-check
const { jestConfig } = require('./config/jest.config');
const { babelConfig } = require('./config/babel.config');
const { babelBuild } = require('./scripts/babelBuild');
const { rollupBuild } = require('./scripts/rollupBuild');
const { clean } = require('./scripts/clean');
const { patch } = require('./scripts/patch');
const { init } = require('./scripts/init');
const { combineCoverage } = require('./scripts/combineCoverage');
const defaults = require('./defaults');

module.exports = {
  __esModule: {
    value: true,
  },
  defaults,
  jestConfig,
  babelConfig,
  babelBuild,
  rollupBuild,
  clean,
  init,
  patch,
  combineCoverage,
};
