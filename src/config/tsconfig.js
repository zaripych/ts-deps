// @ts-check
const { options } = require('../options');
const { trimPathSeparator } = require('../helpers');
const defaults = require('../defaults');

/**
 * @param {Partial<ITsConfigParams>} paramsRaw
 */
const tsConfig = (paramsRaw = {}) => {
  const opts = options();
  const { aliases, baseConfigLocation } = {
    aliases: opts.aliases,
    baseConfigLocation:
      opts.baseTsConfigLocation ||
      './node_modules/ts-deps/lib/config/tsconfig.default.json',
    ...paramsRaw,
  };
  const src = defaults.rootDir;
  const lib = defaults.outDir;
  const paths =
    aliases &&
    Object.keys(aliases).reduce((acc, key) => {
      const alias = trimPathSeparator(aliases[key]);
      return {
        ...acc,
        [key]: [alias],
        [`${key}/*`]: [`${alias}/*`],
      };
    }, {});

  return {
    extends: baseConfigLocation,
    compilerOptions: {
      baseUrl: '.',
      paths,
      outDir: lib,
    },
    include: [src],
  };
};

/**
 * @param {Partial<ITsConfigParams>} paramsRaw
 */
const tsConfigDeclarations = (paramsRaw = {}) => {
  /**
   * @type {ReturnType<typeof tsConfig> & { exclude?: string[] }}
   */
  const defConfig = tsConfig(paramsRaw);

  return {
    ...defConfig,
    compilerOptions: {
      ...defConfig.compilerOptions,
      allowJs: false,
      noEmit: false,
      declaration: true,
      emitDeclarationOnly: true,
    },
    exclude: [
      ...((Array.isArray(defConfig.exclude) && defConfig.exclude) || []),
      defaults.unitTestsGlob,
      defaults.integrationTestsGlob,
    ],
  };
};

module.exports = {
  tsConfig,
  tsConfigDeclarations,
};
