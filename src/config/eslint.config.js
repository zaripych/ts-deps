// @ts-check
import restrictedGlobals from 'confusing-browser-globals';

const typescriptTypeCheckRequiredFor = [
  '@typescript-eslint/await-thenable',
  '@typescript-eslint/no-floating-promises',
  '@typescript-eslint/no-for-in-array',
  '@typescript-eslint/no-implied-eval',
  '@typescript-eslint/no-misused-promises',
  '@typescript-eslint/no-unnecessary-type-assertion',
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/no-unsafe-call',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unsafe-return',
  '@typescript-eslint/prefer-includes',
  '@typescript-eslint/prefer-regexp-exec',
  '@typescript-eslint/prefer-string-starts-ends-with',
  '@typescript-eslint/require-await',
  '@typescript-eslint/restrict-plus-operands',
  '@typescript-eslint/restrict-template-expressions',
  '@typescript-eslint/unbound-method',
  'no-implied-eval',
  'no-var',
  'prefer-const',
  'prefer-rest-params',
  'prefer-spread',
  'require-await',
];

/**
 *  @param {object} rules
 */
function filterRules(rules) {
  return Object.entries(rules).reduce((acc, [key, value]) => {
    return !typescriptTypeCheckRequiredFor.includes(key)
      ? {
          ...acc,
          [key]: value,
        }
      : acc;
  }, {});
}

/**
 *  @param {string[]} list
 */
function filterExtends(list) {
  return list.filter(
    (item) =>
      item !== 'plugin:@typescript-eslint/recommended-requiring-type-checking'
  );
}

/**
 * @param {EsLintConfig} params
 */
export function eslintConfig(params) {
  const rootMerge =
    typeof params?.root !== 'function' ? params?.root : undefined;
  const srcMerge = typeof params?.src !== 'function' ? params?.src : undefined;
  const testsMerge =
    typeof params?.tests !== 'function' ? params?.tests : undefined;

  const rootJavaScriptConfig = {
    root: true,

    env: {
      browser: false,
      es6: true,
      node: true,
      ...rootMerge?.env,
    },

    parser: 'babel-eslint',

    plugins: ['import'],

    extends: [
      'eslint:recommended',
      'prettier',
      'plugin:react/recommended',
      ...(rootMerge?.extends ?? []),
    ],

    parserOptions: {
      ecmaVersion: 2018,
      ...rootMerge?.parserOptions,
    },

    rules: {
      'array-callback-return': 'warn',
      'default-case': ['warn', { commentPattern: '^no default$' }],
      'dot-location': ['warn', 'property'],
      eqeqeq: ['warn', 'smart'],
      'new-parens': 'warn',
      'no-array-constructor': 'warn',
      'no-caller': 'warn',
      'no-cond-assign': ['warn', 'except-parens'],
      'no-const-assign': 'warn',
      'no-control-regex': 'warn',
      'no-delete-var': 'warn',
      'no-dupe-args': 'warn',
      'no-dupe-class-members': 'warn',
      'no-dupe-keys': 'warn',
      'no-duplicate-case': 'warn',
      'no-empty-character-class': 'warn',
      'no-empty-pattern': 'warn',
      'no-eval': 'warn',
      'no-ex-assign': 'warn',
      'no-extend-native': 'warn',
      'no-extra-bind': 'warn',
      'no-extra-label': 'warn',
      'no-fallthrough': 'warn',
      'no-func-assign': 'warn',
      'no-implied-eval': 'warn',
      'no-invalid-regexp': 'warn',
      'no-iterator': 'warn',
      'no-label-var': 'warn',
      'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
      'no-lone-blocks': 'warn',
      'no-loop-func': 'warn',
      'no-mixed-operators': [
        'warn',
        {
          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
          allowSamePrecedence: false,
        },
      ],
      'no-multi-str': 'warn',
      'no-native-reassign': 'warn',
      'no-negated-in-lhs': 'warn',
      'no-new-func': 'warn',
      'no-new-object': 'warn',
      'no-new-symbol': 'warn',
      'no-new-wrappers': 'warn',
      'no-obj-calls': 'warn',
      'no-octal': 'warn',
      'no-octal-escape': 'warn',
      // TODO: Remove this option in the next major release of CRA.
      // https://eslint.org/docs/user-guide/migrating-to-6.0.0#-the-no-redeclare-rule-is-now-more-strict-by-default
      'no-redeclare': ['warn', { builtinGlobals: false }],
      'no-regex-spaces': 'warn',
      'no-restricted-syntax': ['warn', 'WithStatement'],
      'no-script-url': 'warn',
      'no-self-assign': 'warn',
      'no-self-compare': 'warn',
      'no-sequences': 'warn',
      'no-shadow-restricted-names': 'warn',
      'no-sparse-arrays': 'warn',
      'no-template-curly-in-string': 'warn',
      'no-this-before-super': 'warn',
      'no-throw-literal': 'warn',
      'no-undef': 'error',
      'no-restricted-globals': ['error'].concat(restrictedGlobals),
      'no-unreachable': 'warn',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-labels': 'warn',
      'no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: false,
          variables: false,
        },
      ],
      'no-useless-computed-key': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-constructor': 'warn',
      'no-useless-escape': 'warn',
      'no-useless-rename': [
        'warn',
        {
          ignoreDestructuring: false,
          ignoreImport: false,
          ignoreExport: false,
        },
      ],
      'no-with': 'warn',
      'no-whitespace-before-property': 'warn',
      'require-yield': 'warn',
      'rest-spread-spacing': ['warn', 'never'],
      'unicode-bom': ['warn', 'never'],
      'use-isnan': 'warn',
      'valid-typeof': 'warn',
      'no-restricted-properties': [
        'error',
        {
          object: 'require',
          property: 'ensure',
          message:
            'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        },
        {
          object: 'System',
          property: 'import',
          message:
            'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        },
      ],
      'getter-return': 'warn',

      'import/first': 'error',
      'import/no-amd': 'error',
      'import/no-webpack-loader-syntax': 'error',

      'no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '_.*',
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: ['src/*'],
        },
      ],

      'react/prop-types': 'off',

      ...rootMerge?.rules,
    },
  };

  const jsTestsConfig = {
    files: [
      'src/**/__tests__/**/*.js?(x)',
      'src/**/__integration-tests__/**/*.js?(x)',
    ],
    env: {
      'jest/globals': true,
    },
    extends: ['plugin:jest/recommended'],
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      ...testsMerge?.rules,
    },
  };

  const tsTestsConfig = {
    files: [
      'src/**/__tests__/**/*.ts?(x)',
      'src/**/__integration-tests__/**/*.ts?(x)',
    ],
    env: {
      'jest/globals': true,
    },
    extends: ['plugin:jest/recommended'],
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      ...testsMerge?.rules,
    },
  };

  const srcBase = {
    files: ['src/**/*.ts?(x)'],
    parser: '@typescript-eslint/parser',
    env: {
      browser: false,
      es6: true,
      node: true,
      jest: true,
      ...srcMerge?.env,
    },
    parserOptions: {
      project: './tsconfig.json',
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      warnOnUnsupportedTypeScriptVersion: true,
      ...srcMerge?.parserOptions,
    },
    plugins: ['import', '@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
      'prettier/@typescript-eslint',
      ...(srcMerge?.extends ?? []),
    ],
    rules: {
      strict: ['warn', 'never'],
      // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
      'default-case': 'off',
      // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
      'no-dupe-class-members': 'off',
      // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
      'no-undef': 'off',
      // Add TypeScript specific rules (and turn off ESLint equivalents)
      '@typescript-eslint/consistent-type-assertions': 'warn',
      'no-array-constructor': 'off',
      '@typescript-eslint/no-array-constructor': 'warn',
      '@typescript-eslint/no-namespace': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: false,
          variables: false,
          typedefs: false,
        },
      ],
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '_.*',
        },
      ],
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/ban-types': 'off',

      '@typescript-eslint/consistent-type-imports': 'error',

      ...srcMerge?.rules,
    },

    overrides: [
      typeof params?.tests === 'function'
        ? params.tests(tsTestsConfig)
        : tsTestsConfig,
    ],
  };

  /**
   * @type {EsLintConfigParams}
   */
  const srcConfig =
    typeof params?.src === 'function' ? params.src(srcBase) : srcBase;

  return {
    ...(typeof params?.root === 'function'
      ? params.root(rootJavaScriptConfig)
      : rootJavaScriptConfig),
    overrides: [
      jsTestsConfig,
      {
        ...srcConfig,
        ...(srcConfig.rules && {
          rules:
            !srcConfig.parserOptions || !srcConfig?.parserOptions?.project
              ? filterRules(srcConfig.rules)
              : srcConfig.rules,
        }),
        ...(srcConfig.extends && {
          extends:
            !srcConfig.parserOptions || !srcConfig?.parserOptions?.project
              ? filterExtends(srcConfig.extends)
              : srcConfig.extends,
        }),
      },
    ],
  };
}
