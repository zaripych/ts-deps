// @ts-check
const { babelBuild } = require('./babelBuild');
const { patch } = require('./patch');
const { clean } = require('./clean');
const { init } = require('./init');
const { combineCoverage } = require('./combineCoverage');
const { rollupBuild } = require('./rollupBuild');

module.exports = {
  babelBuild,
  patch,
  clean,
  init,
  combineCoverage,
  rollupBuild,
};
