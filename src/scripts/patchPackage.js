//@ts-check
const deepmerge = require('deepmerge')

/**
 * @param {PatchPackageJson} tsDepsPkg
 * @param {PatchPackageJson} templatePkg
 * @param {PatchPackageJson} targetPkg
 * @param {PatchCoreOptions} options
 */
const patchPackageJsonCore = (tsDepsPkg, templatePkg, targetPkg, options) => {
  const pkgKeys = Object.keys(tsDepsPkg)
  if (
    typeof tsDepsPkg !== 'object' ||
    pkgKeys.length === 0 ||
    !pkgKeys.includes('name') ||
    !pkgKeys.includes('version') ||
    !tsDepsPkg.name ||
    !/ts-deps/g.test(tsDepsPkg.name)
  ) {
    throw new Error(
      'Expected real ts-deps package.json contents as an object, got something odd'
    )
  }

  const result = options.aggressive
    ? deepmerge(targetPkg, templatePkg, {
        arrayMerge: (_target, source) => source,
      })
    : deepmerge(templatePkg, targetPkg, {
        arrayMerge: (_target, source) => source,
      })

  if (result.dependencies && options.aggressive && tsDepsPkg.dependencies) {
    for (const pkgKey of Object.keys(result.dependencies)) {
      if (!tsDepsPkg.dependencies[pkgKey]) {
        continue
      }

      result.dependencies[pkgKey] = tsDepsPkg.dependencies[pkgKey]
    }
  }

  if (result.devDependencies && tsDepsPkg.dependencies) {
    for (const pkgKey of Object.keys(result.devDependencies)) {
      if (!tsDepsPkg.dependencies[pkgKey]) {
        continue
      }

      delete result.devDependencies[pkgKey]
    }
  }

  if (!result.devDependencies) {
    result.devDependencies = {}
  }
  result.devDependencies[tsDepsPkg.name] = tsDepsPkg.version

  return result
}

module.exports = {
  patchPackageJsonCore,
}
