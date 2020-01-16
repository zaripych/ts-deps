<h1 align="center">
  ts-deps
  <p align="center" style="font-size: 0.5em">
    <a href="https://www.npmjs.com/package/ts-deps">
      <img src="https://img.shields.io/npm/v/ts-deps.svg" >
    </a>
    <a href="https://travis-ci.com/zaripych/ts-deps">
      <img src="https://travis-ci.com/zaripych/ts-deps.svg?branch=master" alt="Travis Build Status">
    </a>
    <a href="https://codecov.io/gh/zaripych/ts-deps">
      <img src="https://codecov.io/gh/zaripych/ts-deps/branch/master/graph/badge.svg" />
    </a>
    <a href="https://greenkeeper.io/">
      <img src="https://badges.greenkeeper.io/zaripych/ts-deps.svg" />
    </a>
  </p>
  <p align="center">dev dependency for your simple TypeScript projects</p>
</h1>

### Installation

```
npm add ts-deps --save-dev
npx ts-deps init
```

The `init` command will scaffold config files for your project. The typical output would be:

```
scripts/
scripts/build.js
scripts/clean.js
scripts/combineCoverage.js
src/
src/__integration-tests__
src/__tests__
.eslintrc.js
babel.config.js
commitlint.config.js
jest.config.integration.js
jest.config.js
package.json
prettier.config.js
release.config.js
tsconfig.json
tsconfig.declarations.json
```

Following packages already included for you:

- babel - Babel 7 to build `.js` or `.ts` which brings more transformation options and speed
- typescript - TypeScript used for type checking and declarations
- jest - Jest uses same babel config as build pipeline
- eslint
- prettier https://prettier.io/
- semantic-release https://github.com/semantic-release/semantic-release
- husky
- pretty-quick
- commitlint https://conventional-changelog.github.io/commitlint

The `init` command can be run on an existing project, it will change your `package.json` and remove superfluous dev dependencies.

### Building your code

All the source code should be located in `src` directory. Extensions for the code should be `.ts` or `.js`.
You can add `// @ts-check` in the beginning of `.js` files to make TypeScript check those files as well.

For a Web app, please consider using `create-react-app`, however, `.tsx` and `.jsx` extensions are still allowed, but not well-tested.

```
npm build
```

The code will be transformed by Babel and put into `lib` folder. In addition to that `.json` and `.d.ts` files are copied over as well.

### Declarations

If declarations are required, we can generate them by running:

```
npm run declarations
```

This will use `tsconfig.declarations.json` config to write declarations to the same `lib` folder as transformed `.js` or `.ts` files.

### Checking your code

To run all builds and compilation checks we can use the `check` command which is automatically executed by husky on push.

```
npm run check
```

The `build` and other commands listed below are included into `check`.

So, to check your code for Type Script errors we can run:

```
npm run type-check
```

Linting:

```
npm run lint
```

### Aliases

Current configuration supports aliases. Sometimes we need to be able to alias a path to a module in order to require it by that alias name like so:

```
import { db } from '@shared'
```

The above becomes possible with aliases. The setup of aliases is tedious and requires multiple configuration changes that span across Babel, TypeScript and Jest.

With `ts-deps` it should be as simple as creating a `ts-deps.config.js` file at the root of your project and executing `ts-deps patch` to patch `tsconfig.json`:

```
module.exports = {
  aliases: {
    '@core-lib': './src/shared/core-lib',
    '@feature-1': './src/shared/features/feature-1',
  },
}

```

In the above example, in order to reference files within `core-lib` directory we can just use:

```
import Module from '@core-lib'
```

That saves us from having to backward slash to that directory if we have a module in `feature-1` directory that requires it.

### Testing

The library supports two categories of tests: _unit-tests_ and _integration-tests_.

Unit tests should be located within `__tests__` directory anywhere under `src` directory. Deep nesting is supported. Every test should have `.test.` suffix. This is to ensure that the tests can also have test-only related helper files that can be required by the test but not included into result of `build`.

Integration tests should be located within `./src/__integration-tests__` at the root. Similarly, every test should have `.test.` suffix.

Integration and unit tests can be ran separately. If integration tests generate any coverage information we can combine it with unit tests using `combine-coverage` script.

```
npm run test --coverage
npm run integration --coverage
npm run combine-coverage
```

### Release

To use `semantic-release` for release process we could run:

```
npm run release
```

To setup follow the link at the top and follow the steps in documentation. With current config we only need to declare environment variables to make
`semantic-release` push changes to GitHub Releases, git repo and npm.

```
export GH_TOKEN=
export NPM_TOKEN=
export GIT_AUTHOR_EMAIL=
export GIT_AUTHOR_NAME=
export GIT_COMMITTER_EMAIL=
export GIT_COMMITTER_NAME
```

### Happy coding!
