import { patchPackageJsonCore } from '../patchPackage'

describe('patch', () => {
  describe('given invalid ts-deps package contents', () => {
    const tsDepsPkg = {}
    const templatePkg = {}
    const targetPkg = {}

    it('should throw', () => {
      expect(() =>
        patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, {
          aggressive: false,
        })
      ).toThrow()
      expect(() =>
        patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, {
          aggressive: true,
        })
      ).toThrow()
    })
  })

  describe('given valid ts-deps package contents', () => {
    const tsDepsPkg = {
      name: 'ts-deps',
      version: '0.0.1-test',
    }
    const templatePkg = {}
    const targetPkg = {}

    it('should work', () => {
      expect(
        patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, {
          aggressive: false,
        })
      ).toEqual({
        devDependencies: {
          'ts-deps': '0.0.1-test',
        },
      })
    })
  })

  describe('given aggressive mode', () => {
    const opts = {
      aggressive: true,
    }

    describe('given empty template', () => {
      const tsDepsPkg = {
        name: 'ts-deps',
        version: '0.0.1-test',
        dependencies: {
          '@babel/cli': 'ts-deps',
          '@babel/core': 'ts-deps',
          tslint: 'ts-deps',
          typescript: 'ts-deps',
        },
        jest: {},
        husky: {},
      }
      const templatePkg = {}
      const targetPkg = {
        scripts: {
          build: 'target',
          clean: 'target',
        },
        dependencies: {
          '@babel/cli': 'target',
        },
        devDependencies: {
          '@babel/cli': 'target',
          '@babel/core': 'target',
          tslint: 'target',
          typescript: 'target',
        },
      }

      it('should work', () => {
        expect(
          patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, opts)
        ).toEqual({
          scripts: {
            build: 'target',
            clean: 'target',
          },
          dependencies: {
            '@babel/cli': 'ts-deps',
          },
          devDependencies: {
            'ts-deps': '0.0.1-test',
          },
        })
      })
    })

    describe('given non-empty template', () => {
      const tsDepsPkg = {
        name: 'ts-deps',
        version: '0.0.1-test',
        dependencies: {
          '@babel/cli': 'ts-deps',
          '@babel/core': 'ts-deps',
          tslint: 'ts-deps',
          typescript: 'ts-deps',
        },
        jest: {},
        husky: {},
      }
      const templatePkg = {
        scripts: {
          build: 'template',
          clean: 'template',
        },
        dependencies: {
          'other-dependency': 'template',
          '@babel/cli': 'template',
        },
        devDependencies: {
          typescript: 'template',
        },
      }
      const targetPkg = {
        scripts: {
          build: 'target',
          clean: 'target',
        },
        dependencies: {
          '@babel/cli': 'target',
        },
        devDependencies: {
          '@babel/cli': 'target',
          '@babel/core': 'target',
          tslint: 'target',
          typescript: 'target',
        },
      }

      it('should work', () => {
        expect(
          patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, opts)
        ).toEqual({
          scripts: {
            build: 'template',
            clean: 'template',
          },
          dependencies: {
            '@babel/cli': 'ts-deps',
            'other-dependency': 'template',
          },
          devDependencies: {
            'ts-deps': '0.0.1-test',
          },
        })
      })
    })
  })

  describe('given non-aggressive mode', () => {
    const opts = {
      aggressive: false,
    }

    describe('given empty template', () => {
      const tsDepsPkg = {
        name: 'ts-deps',
        version: '0.0.1-test',
        dependencies: {
          '@babel/cli': 'ts-deps',
          '@babel/core': 'ts-deps',
          tslint: 'ts-deps',
          typescript: 'ts-deps',
        },
        jest: {},
        husky: {},
      }
      const templatePkg = {}
      const targetPkg = {
        scripts: {
          build: 'target',
          clean: 'target',
        },
        dependencies: {
          '@babel/cli': 'target',
        },
        devDependencies: {
          '@babel/cli': 'target',
          '@babel/core': 'target',
          tslint: 'target',
          typescript: 'target',
        },
      }

      it('should work', () => {
        expect(
          patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, opts)
        ).toEqual({
          scripts: {
            build: 'target',
            clean: 'target',
          },
          dependencies: {
            '@babel/cli': 'target',
          },
          devDependencies: {
            'ts-deps': '0.0.1-test',
          },
        })
      })
    })

    describe('given non-empty template', () => {
      const tsDepsPkg = {
        name: 'ts-deps',
        version: '0.0.1-test',
        dependencies: {
          '@babel/cli': 'ts-deps',
          '@babel/core': 'ts-deps',
          tslint: 'ts-deps',
          typescript: 'ts-deps',
        },
        jest: {},
        husky: {},
      }
      const templatePkg = {
        scripts: {
          build: 'template',
          clean: 'template',
        },
        dependencies: {
          'other-dependency': 'template',
          '@babel/cli': 'template',
        },
        devDependencies: {
          typescript: 'template',
        },
      }
      const targetPkg = {
        scripts: {
          build: 'target',
          clean: 'target',
        },
        dependencies: {
          '@babel/cli': 'target',
        },
        devDependencies: {
          '@babel/cli': 'target',
          '@babel/core': 'target',
          tslint: 'target',
          typescript: 'target',
        },
      }

      it('should work', () => {
        expect(
          patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, opts)
        ).toEqual({
          scripts: {
            build: 'target',
            clean: 'target',
          },
          dependencies: {
            '@babel/cli': 'target',
            'other-dependency': 'template',
          },
          devDependencies: {
            'ts-deps': '0.0.1-test',
          },
        })
      })
    })
  })
})
