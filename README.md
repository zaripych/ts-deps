<h1 align="center">
  <p align="center">ts-deps</p>
  <p align="center" style="font-size: 0.5em">
    <a href="https://travis-ci.com/zaripych/ts-deps"><img src="https://travis-ci.com/zaripych/ts-deps.svg?branch=master" alt="Travis Build Status"></a>
    <a href="https://coveralls.io/github/zaripych/ts-deps?branch=master"><img src="https://coveralls.io/repos/github/zaripych/ts-deps/badge.svg?branch=master" alt="Coverage Status"></a>
  </p>
</h1>

## the single dev dependency for your simple TypeScript Node projects

### Installation

```
npm add ts-deps --save-dev
npx ts-deps init
```

or

```
yarn add ts-deps --dev
yarn ts-deps init
```

The `init` command will scaffold config files for your project. The typical output would be:

```
scripts/
scripts/build.js
scripts/clean.js
scripts/combineCoverage.js
src/
babel.config.js
commitlint.config.js
jest.config.integration.js
jest.config.js
package.json
prettier.config.js
release.config.js
tsconfig.json
tslint.json
```

Following packages already included for you:

- babel > 7
- typescript > 3.3
- jest
- tslint
- prettier https://prettier.io/
- pretty-quick
- semantic-release https://github.com/semantic-release/semantic-release
- husky
- commitlint https://conventional-changelog.github.io/commitlint

The `init` command can be run on an existing project, it will change your `package.json` and remove superfluous dev dependencies.

### Building your code

All the source code should be located in `src` directory. Extensions for your code should be `.ts` or `.js`.
You can add `// @ts-check` in the beginning of `.js` files to make TypeScript check those files as well.

For a Web app, please consider using `create-react-app`, however, `.tsx` and `.jsx` extensions are still allowed.

```
npm build
```

or

```
yarn build
```

The code will be transformed and put into `lib` folder.

### Checking your code

To run all builds and compilation checks we can use the `check` command which is automatically executed by husky on push.

```
npm run check
```

The build and all below commands are included into `check`.

To check your code for Type Script errors we can run:

```
npm run type-check
```

The linting is executed as part of the `check` script. We can run it separately:

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

That saves us from having to backward slash to that directory if you are currently in `feature-1` directory.

### Testing

The library supports two categories of tests: _unit-tests_ and _integration-tests_.

Unit tests should be located within `__tests__` directory anywhere under `src` directory. Deep nesting is supported. Every test should have `.test.` suffix. This is to ensure that the tests can also have test-only related helper files that can be required by the test.

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

To setup follow the link at the top and read documentation. With current config we only need to declare environment variables to make
`semantic-release` push my changes to GitHub Releases, git repo and npm.

```
export GH_TOKEN=
export NPM_TOKEN=
export GIT_AUTHOR_EMAIL=
export GIT_AUTHOR_NAME=
export GIT_COMMITTER_EMAIL=
export GIT_COMMITTER_NAME
```

### Happy coding!
