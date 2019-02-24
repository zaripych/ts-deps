// @ts-check
const { options } = require('../options')
const { trimPathSeparator } = require('../helpers')
const defaults = require('../defaults')

const tsConfig = ({ aliases } = { ...options() }) => {
  const src = defaults.rootDir
  const paths =
    aliases &&
    Object.keys(aliases).reduce((acc, key) => {
      const alias = trimPathSeparator(aliases[key])
      return {
        ...acc,
        [key]: [alias],
        [`${key}/*`]: [`${alias}/*`],
      }
    }, {})

  return {
    compilerOptions: {
      lib: ['es2017'],
      target: 'es2017',
      baseUrl: '.',
      outDir: 'lib',
      module: 'commonjs',
      sourceMap: false,
      moduleResolution: 'node',
      allowJs: true,
      checkJs: false,
      skipLibCheck: true,
      strict: true,
      noImplicitAny: true,
      suppressImplicitAnyIndexErrors: false,
      strictNullChecks: true,
      strictFunctionTypes: false,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      alwaysStrict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: false,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      paths,
    },
    compileOnSave: false,
    include: [src],
  }
}

module.exports = {
  tsConfig,
}
