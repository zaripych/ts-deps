'use strict';
require('@babel/register');

const { eslintConfig } = require('./src/config/eslint.config');

module.exports = eslintConfig();
