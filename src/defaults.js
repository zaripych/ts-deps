// @ts-check
module.exports = Object.freeze({
  rootDir: 'src',
  libOutDir: 'lib',
  appOutDir: 'dist',
  extensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  copyAdditional: [
    '**/*.d.ts',
    '**/*.json',
    '!**/__tests__/**',
    '!__integration-tests__/**',
  ],
  nodeVersion: '8.12',
  unitTestsGlob: 'src/**/__tests__/**',
  integrationTestsGlob: 'src/__integration-tests__/**',
  optionsFileName: 'ts-deps.config.js',
});
