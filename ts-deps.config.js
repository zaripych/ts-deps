module.exports = {
  aliases: {
    'ts-deps': './src',
  },
  patchOnly: ['tsconfig.json', 'tsconfig.declarations.json'],
  baseTsConfigLocation: './src/config/tsconfig.default.json',
};
