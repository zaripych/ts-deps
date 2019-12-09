// @ts-check
import { spawnSync } from 'child_process';
import {
  existsSync,
  copy,
  pathExists,
  stat,
  ensureDir,
  remove,
  readdir,
} from 'fs-extra';
import { resolve, join } from 'path';
import { patch } from './patch';
import { initializeTemplates } from '../helpers';
import yargs from 'yargs';

const PKG_JSON = 'package.json';

/**
 * @param {string} initDir
 */
const npmInitIfRequired = async initDir => {
  const packageJsonPath = resolve(initDir, PKG_JSON);

  const exists = await pathExists(packageJsonPath);
  if (exists) {
    return false;
  }

  const initProcessResult = spawnSync('npm', ['init'], {
    stdio: 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32',
    cwd: initDir,
  });

  if (initProcessResult.status) {
    process.exit(initProcessResult.status);
  }

  if (!existsSync(packageJsonPath)) {
    process.exit(0);
  }

  return true;
};

/**
 * @param {{ templateDirs: string[], initDir: string }} param0
 */
const copyFromTemplates = async ({ templateDirs, initDir }) => {
  for (const templateDir of templateDirs) {
    const toCopyDir = join(templateDir, 'to-copy');

    const dirToCopy = await stat(toCopyDir).catch(() => Promise.resolve(null));
    if (!dirToCopy || !dirToCopy.isDirectory()) {
      throw new Error('Source template directory doesnt exist: ' + toCopyDir);
    }

    await copy(toCopyDir, initDir, {
      filter: async (_src, dest) => {
        const destStats = await stat(dest).catch(() => Promise.resolve(null));
        if (destStats && destStats.isDirectory()) {
          return true;
        }

        if (dest !== initDir) {
          console.log('init: writing', dest);
        }

        return true;
      },
      overwrite: true,
    });
  }

  const dirsToCreate = [
    //
    'src',
    'src/__tests__',
    'src/__integration-tests__',
  ];

  await Promise.all(
    dirsToCreate
      .map(dir => join(initDir, dir))
      .map(dir => ensureDir(dir).catch(() => Promise.resolve()))
  );
};

/**
 * @param {string} cwd
 * @param {boolean | undefined} force
 */
const errorIfNotEmpty = async (cwd, force) => {
  if (force) {
    return;
  }

  // a minimum set of files that are safe
  const ignoreFiles = [
    'package.json',
    'yarn.lock',
    'package-lock.json',
    'node_modules',
  ];

  const currentDirectoryContents = await readdir(cwd);

  const dirContentsFiltered = currentDirectoryContents.filter(
    item => !item.startsWith('.') && !ignoreFiles.includes(item)
  );

  if (dirContentsFiltered.length > 0) {
    if (!currentDirectoryContents.includes('.git')) {
      console.log(
        '🚨  Oops. It seems that current directory contains files other than package.json but git is not initialized. ' +
          'The init command overwrites files, so it is recommended to initialize a git repository for backup.'
      );
      throw new Error('Current directory not quite empty');
    }

    const untrackedFilesCmd = spawnSync(
      'git',
      ['ls-files', '--other', '--directory', '--exclude-standard'],
      {
        cwd,
        encoding: 'utf8',
        shell: process.platform === 'win32',
      }
    );

    if (
      untrackedFilesCmd.stdout &&
      untrackedFilesCmd.stdout.trim().length > 0
    ) {
      console.log(
        '🚨  Oops. It seems that current directory contains untracked files. ' +
          'The init command overwrites files, so it is recommended to at least stage current changes in git before initializing.'
      );
      throw new Error('Current directory not quite empty');
    }
  }
};

/**
 * @param {InitParams} param0
 */
export const init = async ({
  cwd = process.cwd(),
  targetDirectory = process.cwd(),
  template,
  force,
} = {}) => {
  const currentDir = resolve(cwd);
  const initDir = resolve(targetDirectory);

  const currentDirStat = await stat(currentDir).catch(_err => null);
  if (!currentDirStat || !currentDirStat.isDirectory()) {
    throw new Error('Current directory must resolve to an existing directory');
  }

  const initDirStat = await stat(initDir).catch(_err => null);
  if (!initDirStat || !initDirStat.isDirectory()) {
    throw new Error('Init directory must resolve to an existing directory');
  }

  await errorIfNotEmpty(initDir, force);

  const templates = await initializeTemplates(template, currentDir, initDir);

  await npmInitIfRequired(initDir);

  const copyTemplates = () =>
    copyFromTemplates({
      templateDirs: templates.map(item => item.dir),
      initDir,
    });

  const generate = () =>
    patch({
      initializedTemplates: templates,
      cwd: currentDir,
      targetDirectory: initDir,
      forceOverwrites: true,
      aggressive: true,
    });

  await copyTemplates();

  await generate();

  if (template) {
    for (const tmplt of templates) {
      if (tmplt.type === 'package') {
        await remove(tmplt.dir);
      }
    }
  }
};

/**
 * @param {import('yargs').Arguments<{ directory?: string, force: boolean, template?: string }>} args
 */
async function initHandler(args) {
  try {
    await init({
      ...(args.directory && {
        targetDirectory: args.directory,
      }),
      ...(args.template && {
        template: args.template,
      }),
      ...(typeof args.force === 'boolean' && {
        force: args.force,
      }),
    });
  } catch (err) {
    console.error('💥  ', err);
    process.exit(1);
  }
}

export const initCliModule = {
  command: ['init'],
  /**
   * @param {import('yargs').Argv} y
   */
  builder: y =>
    y
      .option('directory', {
        string: true,
        description:
          'Directory to initialize new package in, defaults to process.cwd()',
      })
      .option('template', {
        string: true,
        description:
          'Name of the package to use as template, or path to a template directory',
      })
      .option('force', {
        boolean: true,
        default: false,
        description: 'Disable non-empty directory warning',
      }),
  /**
   * @param {import('yargs').Arguments<{ force: boolean, template?: string }>} args
   */
  handler: initHandler,
  describe:
    'Initialize new package, or integrate with existing package - the cli will overwrite existing files',
};

export async function initCli() {
  const args = initCliModule.builder(yargs).parse();
  await initHandler(args);
}
