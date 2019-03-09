import { patchTsConfigCore } from '../patchTsConfig';

type DepsType = typeof patchTsConfigCore['defaultDeps'];

const buildDeps = (
  value: { [P in keyof DepsType]: unknown } & { [key: string]: unknown }
) =>
  Object.keys(value).reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        typeof value[key] === 'function'
          ? jest.fn(value[key] as () => void)
          : value[key],
    }),
    {}
  ) as DepsType;

describe('patchTsConfigCore', () => {
  describe('given non empty old config, aggressive', () => {
    const oldConfig = {
      compilerOptions: {
        myCustomOption: 'original-value',
        anotherOption: 'original-value',
      },
    };
    const newConfig = {
      compilerOptions: {
        myCustomOption: 'new-value',
      },
      value: 'new-config-prop',
    };
    const aggressive = true;
    const declarations = false;
    const baseTsConfigLocation = './node_modules/tsconfig.json';

    it('should work', async () => {
      const result = await patchTsConfigCore(
        {
          oldConfig,
          baseTsConfigLocation,
          aggressive,
          declarations,
        },
        buildDeps({
          tsConfig: () => newConfig,
          tsConfigDeclarations: () => newConfig,
        })
      );
      expect(result).toEqual({
        compilerOptions: {
          myCustomOption: 'new-value',
        },
        value: 'new-config-prop',
      });
    });
  });

  describe('given empty old config, aggressive, no declarations', () => {
    const oldConfig = {};
    const newConfig = {
      value: 'new-config-prop',
    };
    const aggressive = true;
    const declarations = false;
    const baseTsConfigLocation = './node_modules/tsconfig.json';
    const deps = buildDeps({
      tsConfig: () => newConfig,
      tsConfigDeclarations: () => newConfig,
    });

    it('should work', async () => {
      const result = await patchTsConfigCore(
        {
          oldConfig,
          baseTsConfigLocation,
          aggressive,
          declarations,
        },
        deps
      );
      expect(result).toEqual({
        value: 'new-config-prop',
      });
      expect(deps.tsConfig).toBeCalled();
    });
  });

  describe('given empty config, non aggressive, declarations', () => {
    const oldConfig = {};
    const newConfig = {
      value: 'new-config-prop',
    };
    const aggressive = false;
    const declarations = true;
    const baseTsConfigLocation = './node_modules/tsconfig.json';

    it('should work', async () => {
      const result = await patchTsConfigCore(
        {
          oldConfig,
          baseTsConfigLocation,
          aggressive,
          declarations,
        },
        buildDeps({
          tsConfig: () => newConfig,
          tsConfigDeclarations: () => newConfig,
        })
      );
      expect(result).toEqual({
        value: 'new-config-prop',
      });
    });
  });

  describe('given non empty old config, non-aggressive, declarations', () => {
    const oldConfig = {
      compilerOptions: {
        myCustomOption: 'original-value',
      },
    };
    const newConfig = {
      compilerOptions: {
        myCustomOption: 'new-value',
      },
      value: 'new-config-prop',
      include: ['arr'],
    };
    const aggressive = false;
    const declarations = true;
    const baseTsConfigLocation = './node_modules/tsconfig.json';
    const deps = buildDeps({
      tsConfig: () => newConfig,
      tsConfigDeclarations: () => newConfig,
    });

    it('should work', async () => {
      const result = await patchTsConfigCore(
        {
          oldConfig,
          baseTsConfigLocation,
          aggressive,
          declarations,
        },
        deps
      );
      expect(result).toEqual({
        compilerOptions: {
          myCustomOption: 'new-value',
        },
        value: 'new-config-prop',
        include: ['arr'],
      });
      expect(deps.tsConfigDeclarations).toBeCalled();
    });
  });
});
