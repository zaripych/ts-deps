// @ts-check
import { tsConfig, tsConfigDeclarations } from '../config/tsconfig';
import deepmerge from 'deepmerge';

const defaultDeps = Object.freeze({
  tsConfig,
  tsConfigDeclarations,
});

/**
 *
 * @param {{ oldConfig: {}, baseTsConfigLocation?: string, aggressive: boolean, declarations: boolean}} param0
 */
export const patchTsConfigCore = (
  { oldConfig, baseTsConfigLocation, aggressive, declarations },
  deps = defaultDeps
) => {
  const tsParams = {
    ...(baseTsConfigLocation && {
      baseConfigLocation: baseTsConfigLocation,
    }),
  };

  const config = declarations
    ? deps.tsConfigDeclarations(tsParams)
    : deps.tsConfig(tsParams);

  /** @type {typeof config} */
  const result = aggressive
    ? config
    : deepmerge(oldConfig, config, {
        arrayMerge: (_target, source) => source,
      });

  return result;
};

patchTsConfigCore.defaultDeps = defaultDeps;
