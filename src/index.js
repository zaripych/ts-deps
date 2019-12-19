// @ts-check
export { jestConfig } from './config/jest.config';
export { babelConfig } from './config/babel.config';
export {
  clean,
  patch,
  init,
  release,
  combineCoverage,
  rollupBuild,
  babelBuild,
} from './scripts';
export { defaults } from './defaults';
