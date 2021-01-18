// @ts-check
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createReporter } from 'istanbul-api';
import { sync } from 'fast-glob';

/**
 * @param {Partial<CombineCoverageParams>} paramsRaw
 */
export const combineCoverage = (paramsRaw = {}) => {
  const cwd = paramsRaw.cwd || process.cwd();

  /**
   * @type {string[]}
   */
  const filePaths = sync('./coverage-*/coverage-final.json', {
    cwd,
    onlyFiles: true,
    absolute: true,
  });

  const coverageData = filePaths.map((filePath) => require(filePath));

  const map = createCoverageMap();
  for (const data of coverageData) {
    map.merge(data);
  }

  const reporter = createReporter();
  reporter.addAll(['json', 'lcov', 'text']);
  reporter.write(map);
};
