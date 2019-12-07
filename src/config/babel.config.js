// @ts-check
'use strict';

import { defaults } from '../defaults';
import { trimPathSeparator } from '../helpers';
import { options } from '../options';

/**
 * @param {Partial<IBabelConfigParams>} paramsRaw
 */
export const babelConfig = (paramsRaw = {}) => {
  const opts = options();
  const { aliases, nodeVersion, presetEnvConfig } = {
    aliases: opts.aliases,
    nodeVersion: opts.nodeVersion || defaults.nodeVersion,
    /**
     * @param {{}} defaultConfig
     */
    presetEnvConfig: defaultConfig => defaultConfig,
    ...paramsRaw,
  };
  const src = defaults.rootDir;

  const config = {
    presets: [
      [
        '@babel/preset-env',
        presetEnvConfig({
          targets: {
            node: nodeVersion,
          },
        }),
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      !!aliases && [
        'module-resolver',
        {
          root: [src],
          alias: Object.keys(aliases).reduce((acc, key) => {
            return {
              ...acc,
              [key]: trimPathSeparator(aliases[key]),
            };
          }, {}),
        },
      ],
      '@babel/proposal-class-properties',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
    ].filter(Boolean),
    ignore: [`${src}/**/*.d.ts`, `${src}/**/*.json`],
  };

  return config;
};

export default babelConfig();
