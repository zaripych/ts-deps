// @ts-check
const { babelBuild } = require('./build');
const { patch } = require('./patch');
const { clean } = require('./clean');
const { init } = require('./init');
const { combineCoverage } = require('./combineCoverage');

module.exports = {
  babelBuild,
  patch,
  clean,
  init,
  combineCoverage,
};
