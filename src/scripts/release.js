// @ts-check
import { spawnSync } from 'child_process';
import { options } from '../options';

const defaultProps = () => ({ beta: true, cwd: process.cwd(), docker: true });

/**
 * Release using semantic-release through docker or npx
 *
 * @param {ReleaseParams} paramsRaw
 */
export async function release(paramsRaw = defaultProps()) {
  const { beta, cwd, docker } = {
    ...defaultProps(),
    ...paramsRaw,
  };
  const { semanticReleaseEnvVars } = options(cwd);

  const whichDocker =
    docker &&
    spawnSync('which', ['docker'], {
      shell: process.platform === 'win32',
    });

  const envPatterns = semanticReleaseEnvVars ?? [
    //
    /TRAVIS_.*/,
    /GITHUB_.*/,
    /NPM_TOKEN/,
    /GH_TOKEN/,
    /DOCKER_USERNAME/,
    /DOCKER_PASSWORD/,
  ];

  const envVars = Object.entries(process.env).reduce(
    (acc, [key, value]) => ({
      ...acc,
      ...(envPatterns.some(pattern => pattern.test(key)) && {
        [key]: value,
      }),
    }),
    {}
  );

  if (!docker || (whichDocker && whichDocker.status !== 0)) {
    // npx is going to be just a little slower because it is more CPU intensive:
    // E.g:
    // time npx --ignore-existing --cache ./cache semantic-release --help
    // ... 11.13s user 1.85s system 84% cpu 15.445 total
    // vs
    // time ./scripts/semantic-release.sh --help
    // ...  0.17s user 0.10s system 1% cpu 13.967 total
    //
    // So CI machine with higher network bandwidth with limited/virtualized CPU should be faster with docker and slower with npx
    if (docker) {
      console.warn('⚠  Using npx instead of docker ...');
    }

    const semanticRelease = beta ? 'semantic-release@beta' : 'semantic-release';

    const args = [
      '-p',
      semanticRelease,
      'semantic-release',
      ...process.argv.slice(2),
    ];

    console.log('🚀  npx', args.join(' '));

    spawnSync('npx', args, {
      env: {
        PATH: process.env.PATH,
        ...envVars,
      },
      stdio: 'inherit',
    });
  } else {
    const semanticRelease = beta
      ? 'zaripych/semantic-release:beta'
      : 'zaripych/semantic-release';

    const args = [
      'run',
      '--rm',
      '-v',
      `${process.cwd()}:/opt/cwd`,
      ...Object.keys(envVars).map(key => `--env ${key}`),
      semanticRelease,
      'semantic-release',
      ...process.argv.slice(2),
    ];

    console.log('🚀  docker', args.join(' '));

    spawnSync('docker', args, {
      env: envVars,
      stdio: 'inherit',
    });
  }
}
