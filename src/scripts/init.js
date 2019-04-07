// @ts-check
const { spawnSync } = require('child_process');
const {
  existsSync,
  copy,
  pathExists,
  stat,
  ensureDir,
  remove,
  readdir,
} = require('fs-extra');
const { resolve, join } = require('path');
const { patch } = require('./patch');
const { initializeTemplates } = require('../helpers');
const yargs = require('yargs');

const PKG_JSON = 'package.json';

const npmInitIfRequired = async () => {
  const packageJsonPath = resolve(PKG_JSON);

  const exists = await pathExists(packageJsonPath);
  if (exists) {
    return false;
  }

  const initProcessResult = spawnSync('npm', ['init'], {
    stdio: 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (initProcessResult.status !== 0) {
    process.exit(initProcessResult.status);
  }

  if (!existsSync(packageJsonPath)) {
    process.exit(0);
  }

  return true;
};

/**
 * @param {{ templateDirs: string[], currentDir: string }} param0
 */
const copyFromTemplates = async ({ templateDirs, currentDir }) => {
  for (const templateDir of templateDirs) {
    const toCopyDir = join(templateDir, 'to-copy');

    await copy(toCopyDir, currentDir, {
      filter: async (_src, dest) => {
        const destStats = await stat(dest).catch(() => Promise.resolve(null));
        if (destStats && destStats.isDirectory()) {
          return true;
        }

        if (dest !== currentDir) {
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
      .map(dir => join(currentDir, dir))
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

  const ignoreFiles = ['package.json'];

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
const init = async ({ cwd = process.cwd(), template, force } = {}) => {
  const currentDir = resolve(cwd);

  await errorIfNotEmpty(currentDir, force);

  const templates = await initializeTemplates(template, currentDir);

  await npmInitIfRequired();

  const copyTemplates = () =>
    copyFromTemplates({
      templateDirs: templates.map(item => item.dir),
      currentDir,
    });

  const generate = () =>
    patch({
      initializedTemplates: templates,
      cwd: currentDir,
      forceOverwrites: true,
      aggressive: true,
    });

  await copyTemplates();

  await generate();

  if (template) {
    for (const tmplt of templates) {
      if (tmplt.type === 'package') {
        await remove(join(currentDir, tmplt.dir));
      }
    }
  }
};

/**
 * @param {import('yargs').Arguments<{ force: boolean, template?: string }>} args
 */
async function initHandler(args) {
  try {
    await init({
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

const initCliModule = {
  command: ['init'],
  /**
   * @param {import('yargs').Argv} y
   */
  builder: y =>
    y
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

async function initCli() {
  const args = initCliModule.builder(yargs).parse();
  await initHandler(args);
}

module.exports = {
  init,
  initCli,
  initCliModule,
};
