'use strict';
require('@babel/register');
const { jestConfig } = require('./src');

module.exports = jestConfig({
  isIntegrationTest: false,
});
