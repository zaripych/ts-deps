// @ts-check
import { spawnSync } from 'child_process';
import { options } from '../options';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const defaultProps = () => ({
  beta: true,
  cwd: process.cwd(),
  docker: true,
  setExitCode: true,
});

/**
 * Release using semantic-release through docker or npx
 *
 * @param {ReleaseParams} paramsRaw
 */
export async function release(paramsRaw = defaultProps()) {
  const { beta, cwd, docker, cmdArgs, setExitCode } = {
    ...defaultProps(),
    ...paramsRaw,
  };
  const { semanticReleaseEnvVars } = options(cwd);

  const whichDocker =
    docker &&
    spawnSync('which', ['docker'], {
      env: process.env,
      shell: process.platform === 'win32',
    });

  /**
   * @type Array<string | RegExp>
   */
  const envPatterns = semanticReleaseEnvVars ?? [
    'GH_TOKEN',
    'NPM_TOKEN',

    'GIT_AUTHOR_EMAIL',
    'GIT_AUTHOR_NAME',
    'GIT_COMMITTER_EMAIL',
    'GIT_COMMITTER_NAME',

    'DOCKER_USERNAME',
    'DOCKER_PASSWORD',

    'TRAVIS',
    'TRAVIS_PULL_REQUEST',
    'TRAVIS_COMMIT',
    'TRAVIS_TAG',
    'TRAVIS_BUILD_NUMBER',
    'TRAVIS_BUILD_WEB_URL',
    'TRAVIS_BRANCH',
    'TRAVIS_JOB_NUMBER',
    'TRAVIS_JOB_WEB_URL',
    'TRAVIS_PULL_REQUEST_BRANCH',
    'TRAVIS_REPO_SLUG',
    'TRAVIS_BUILD_DIR',

    'GITHUB_EVENT_PATH',
    'GITHUB_ACTION',
    'GITHUB_EVENT_NAME',
    'GITHUB_REF',
    'GITHUB_SHA',
    'GITHUB_REPOSITORY',
    'GITHUB_WORKSPACE',
  ];

  const envVars = Object.entries(process.env).reduce(
    (acc, [key, value]) => ({
      ...acc,
      ...(envPatterns.some(pattern =>
        typeof pattern === 'string' ? pattern === key : pattern.test(key)
      ) && {
        [key]: value,
      }),
    }),
    {}
  );

  if (!docker || (whichDocker && whichDocker.status !== 0)) {
    // npx/npm is going to be just a little slower because it is more CPU intensive:
    // E.g:
    // time npx --ignore-existing --cache ./cache semantic-release --help
    // ... 11.13s user 1.85s system 84% cpu 15.445 total
    // vs
    // time ./scripts/semantic-release.sh --help
    // ...  0.17s user 0.10s system 1% cpu 13.967 total
    //
    // So CI machine with higher network bandwidth with limited/virtualized CPU should be faster with docker and slower with npx
    if (docker) {
      console.warn('⚠  Using npm install instead of docker ...');
    }

    const SUB_DIR = './semantic-release';

    if (!existsSync(SUB_DIR)) {
      mkdirSync(SUB_DIR);
    }

    const semanticRelease = beta ? 'semantic-release@beta' : 'semantic-release';
    const semanticReleaseExec = beta
      ? '@semantic-release/exec@beta'
      : '@semantic-release/exec';

    const installArgs = [
      'install',
      '--prefix',
      SUB_DIR,
      '--production',
      semanticRelease,
      semanticReleaseExec,
      '--no-save',
    ];

    console.log('🚀  npm', installArgs.join(' '));

    const installResult = spawnSync('npm', installArgs, {
      env: {
        PATH: process.env.PATH,
      },
      stdio: 'inherit',
    });

    if (installResult.error) {
      throw installResult.error;
    }

    if (setExitCode && typeof installResult.status === 'number') {
      process.exitCode = installResult.status;
    }

    if (installResult.status !== 0) {
      return;
    }

    const args = [
      join(SUB_DIR, 'node_modules/.bin/semantic-release'),
      ...(cmdArgs ?? process.argv.slice(2)),
    ];

    const result = spawnSync('node', args, {
      env: {
        PATH: process.env.PATH,
        ...envVars,
      },
      stdio: 'inherit',
    });

    if (result.error) {
      throw result.error;
    }

    if (setExitCode && typeof result.status === 'number') {
      process.exitCode = result.status;
    }
  } else {
    const semanticRelease = beta
      ? 'zaripych/semantic-release:beta'
      : 'zaripych/semantic-release';

    const args = [
      'run',
      '--rm',
      '-v',
      `${process.cwd()}:/opt/cwd`,
      '-v',
      `/var/run/docker.sock:/var/run/docker.sock`,
      ...Object.keys(envVars).reduce((acc, key) => [...acc, '--env', key], []),
      semanticRelease,
      'semantic-release',
      ...(cmdArgs ?? process.argv.slice(2)),
    ];

    console.log('🚀  docker', args.join(' '));

    const result = spawnSync('docker', args, {
      env: {
        PATH: process.env.PATH,
        ...envVars,
      },
      stdio: 'inherit',
    });

    if (result.error) {
      throw result.error;
    }

    if (setExitCode && typeof result.status === 'number') {
      process.exitCode = result.status;
    }
  }
}
