// @ts-check
import { spawn } from 'child_process';
import { defaults } from '../defaults';
import { copy } from 'fs-extra';
import fg from 'fast-glob';
import { join } from 'path';

/**
 * @param {string[]} args All arguments
 * @param {string[]} lookupArgs Arguments we are interested in
 * @param {string[]} values Values to set
 */
const optionalArgBuilder = (args, lookupArgs, values) => {
  const contains = args.some((arg) =>
    lookupArgs.some((lookupArg) => lookupArg === arg)
  );
  // if arguments already contain one of the arguments
  // we define by default, then return an empty array
  if (contains) {
    return [];
  }

  return values
    .map((val) => (val ? [lookupArgs[0], val] : [lookupArgs[0]]))
    .reduce((acc, item) => [...acc, ...item], []);
};

/**
 * @param {BabelBuildParams} param
 */
export async function babelBuild({
  commandLine,
  doNotOutputTests = true,
  logCommandLine = true,
  extensions = defaults.extensions,
  outDir = defaults.libOutDir,
  rootDir = defaults.rootDir,
  unitTestsGlob = defaults.unitTestsGlob,
  integrationTestsGlob = defaults.integrationTestsGlob,
  copyAdditional = defaults.copyAdditional,
} = {}) {
  const exts = extensions.map((ext) => `.${ext}`).join(',');

  const args = !Array.isArray(commandLine)
    ? process.argv.splice(2)
    : commandLine;

  const isHelpNeeded = args.includes('--help') || args.includes('-h');

  const skipCopying = args.includes('--no-copy-files');

  if (!isHelpNeeded && !skipCopying && copyAdditional.length > 0) {
    console.log();
    console.log(
      '🚚  Copying files not-transformed by babel',
      copyAdditional.join(','),
      'from',
      rootDir
    );

    /**
     * @type string[]
     */
    const files = await fg(copyAdditional, {
      cwd: join(process.cwd(), rootDir),
    });

    await Promise.all(
      files.map((path) => {
        const src = join(rootDir, path);
        const dest = join(outDir, path);
        return copy(src, dest);
      })
    );

    console.log('✔  Successfully copied', files.length, 'files');
    console.log('');
  }

  /**
   * @param {string[]} lookup
   * @param {string[]} values
   */
  const optionalArg = (lookup, values) =>
    optionalArgBuilder(args, lookup, values);

  const spawnArgs = isHelpNeeded
    ? [...args]
    : [
        rootDir,
        ...optionalArg(['--out-dir'], [outDir]),
        ...optionalArg(['-s'], ['false']),
        ...optionalArg(['--extensions'], [exts]),
        ...optionalArg(
          ['--ignore'],
          doNotOutputTests
            ? [`${unitTestsGlob}`, `${integrationTestsGlob}`]
            : []
        ),
        ...args,
      ];

  if (logCommandLine) {
    console.log('🚀  babel', spawnArgs.join(' '));
  }

  const babelProc = spawn('babel', spawnArgs, {
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  const waitForBabel = new Promise((res, _rej) => {
    babelProc.on('exit', (code) => {
      res(code);
    });
  });

  await waitForBabel;

  if (isHelpNeeded) {
    console.log(`
  Extra:
  --no-copy-files                             To skip copying additional files (${copyAdditional.join(
    ','
  )})`);
  }
}
