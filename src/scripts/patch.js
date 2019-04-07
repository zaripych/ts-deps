// @ts-check

const { resolve, extname, join } = require('path');
const { readFile, writeFile, pathExists } = require('fs-extra');
const { format, resolveConfig } = require('prettier');
const { initializeTemplates, promptForOverwrite } = require('../helpers');
const { options } = require('../options');
const { patchPackageJsonCore } = require('./patchPackage');
const { patchTsConfigCore } = require('./patchTsConfig');
const { patchText } = require('./patchText');
const yargs = require('yargs');

const PKG_JSON = 'package.json';

/**
 * @param {{templatesDir: string, toPatch: string|undefined, aggressive: boolean | undefined }} param0
 */
const patchPackageJson = async ({ toPatch, templatesDir, aggressive }) => {
  const tsDepsPackageJsonPath = join(__dirname, '../../package.json');
  const templatePackageJsonPath = join(
    templatesDir,
    'to-process',
    'package.json'
  );

  const tsDepsPkg = JSON.parse(
    await readFile(tsDepsPackageJsonPath, { encoding: 'utf-8' })
  );
  const templatePkg = JSON.parse(
    await readFile(templatePackageJsonPath, { encoding: 'utf-8' })
  );
  const targetPkg = (toPatch && JSON.parse(toPatch)) || {};

  const result = patchPackageJsonCore(tsDepsPkg, templatePkg, targetPkg, {
    aggressive: aggressive || false,
  });

  /**
   * @type Promise<string>
   */
  return JSON.stringify(result);
};

/**
 *
 * @param {{ toPatch?: string, baseTsConfigLocation?: string, aggressive?: boolean, declarations?: boolean}} param0
 */
const patchTsConfig = async ({
  toPatch,
  baseTsConfigLocation,
  aggressive = false,
  declarations = false,
}) => {
  const oldConfig = (toPatch && JSON.parse(toPatch)) || {};

  const result = await patchTsConfigCore({
    oldConfig,
    baseTsConfigLocation,
    aggressive,
    declarations,
  });

  return JSON.stringify(result);
};

/**
 * @param {{toPatch: string | undefined, templatesDir: string}} param0
 */
const patchGitignore = async ({ toPatch, templatesDir }) => {
  const templateGitignorePath = join(templatesDir, 'to-process', 'gitignore');

  const sourceExists = await pathExists(templateGitignorePath);
  if (!sourceExists) {
    return toPatch;
  }

  const newText = await readFile(templateGitignorePath, { encoding: 'utf-8' });

  const result = await patchText({
    oldText: toPatch,
    newText,
    unique: true,
  });

  return result;
};

/**
 * @param {string} dest
 */
const promptForOverwriteBeforePatch = async dest => {
  return pathExists(dest).then(exists =>
    exists ? promptForOverwrite(dest) : Promise.resolve(true)
  );
};

/**
 * @param {TemplateInfo} template
 * @param {PatchParams} params
 */
const buildPatcherPerTemplate = (template, params) => {
  return [
    {
      file: PKG_JSON,
      /**
       * @param {string|undefined} toPatch
       */
      contents: async toPatch =>
        await patchPackageJson({
          toPatch,
          templatesDir: template.dir,
          aggressive: params.aggressive,
        }),
    },
    {
      file: '.gitignore',
      /**
       * @param {string|undefined} toPatch
       */
      contents: async toPatch =>
        await patchGitignore({
          toPatch,
          templatesDir: template.dir,
        }),
    },
  ];
};

/**
 * @param {TemplateInfo[]} templates
 * @param {PatchParams} params
 */
const buildPatchers = (templates, params) => {
  const { baseTsConfigLocation, aggressive } = params;

  const defaultPatchers = [
    {
      file: 'tsconfig.json',
      /**
       * @param {string|undefined} toPatch
       */
      contents: async toPatch =>
        await patchTsConfig({
          toPatch,
          baseTsConfigLocation,
          aggressive,
        }),
    },
    {
      file: 'tsconfig.declarations.json',
      /**
       * @param {string|undefined} toPatch
       */
      contents: async toPatch =>
        await patchTsConfig({
          toPatch,
          baseTsConfigLocation,
          aggressive,
          declarations: true,
        }),
    },
  ];

  return [
    ...defaultPatchers,
    ...templates
      .map(template => buildPatcherPerTemplate(template, params))
      .reduce((acc, patchers) => [...acc, ...patchers], []),
  ];
};

/**
 * @param {string|undefined} unformattedContents
 * @param {string} fullPath
 * @param {{}|null} prettierConfig
 */
const prettierFormat = (unformattedContents, fullPath, prettierConfig) => {
  const ext = extname(fullPath);
  const prettierExtensionsToFormat = ['.js', '.ts', '.json', '.jsx', '.tsx'];

  if (unformattedContents && prettierExtensionsToFormat.includes(ext)) {
    return format(unformattedContents, {
      ...prettierConfig,
      ...(ext === '.json' && { parser: 'json' }),
    });
  } else {
    return unformattedContents;
  }
};

/**
 * @param {PatchParams} paramsRaw
 */
const patch = async (paramsRaw = {}) => {
  const cwd = paramsRaw.cwd || process.cwd();
  const opts = options(cwd);

  const params = {
    cwd,
    aggressive: false,
    patchOnly: opts.patchOnly || [],
    baseTsConfigLocation: opts.baseTsConfigLocation,
    forceOverwrites: false,
    ...paramsRaw,
  };

  const templates =
    params.initializedTemplates ||
    (await initializeTemplates(params.template, params.cwd));

  const patchers = buildPatchers(templates, params);

  const prettierConfig = await resolveConfig(
    join(params.cwd, './package.json')
  );

  for (const item of patchers) {
    if (Array.isArray(params.patchOnly) && params.patchOnly.length > 0) {
      if (!params.patchOnly.includes(item.file)) {
        continue;
      }
    }

    const fullPath = resolve(join(params.cwd, item.file));

    const oldContents = await readFile(fullPath, { encoding: 'utf-8' }).catch(
      () => Promise.resolve(undefined)
    );

    const unformattedContents = await item.contents(oldContents);

    const newContents = prettierFormat(
      unformattedContents,
      fullPath,
      prettierConfig
    );

    const prompt = async () => {
      if (params.forceOverwrites) {
        return true;
      }

      return promptForOverwriteBeforePatch(fullPath);
    };

    if (oldContents !== newContents) {
      const shouldPatch = await prompt();

      if (!shouldPatch) {
        console.log('patch: skipping', fullPath);
        continue;
      }

      console.log('patch: patching', fullPath);

      await writeFile(fullPath, newContents, {
        encoding: 'utf-8',
      });
    } else {
      console.log('patch: no changes to', fullPath);
    }
  }
};

/**
 * @param {import('yargs').Arguments} args
 */
async function patchHandler(args) {
  try {
    await patch({
      ...(typeof args.interactive === 'boolean' && {
        forceOverwrites: !args.interactive,
      }),
      ...(typeof args.only === 'string' && {
        patchOnly: [args.only],
      }),
      ...(typeof args.only !== 'string' &&
        Array.isArray(args.only) && {
          patchOnly: args.only,
        }),
    });
  } catch (err) {
    console.error('💥  ', err);
    process.exit(1);
  }
}

const patchCliModule = {
  command: ['patch'],
  /**
   * @param {import('yargs').Argv} y
   */
  builder: y =>
    y
      .boolean('interactive')
      .alias('i', 'interactive')
      .describe('interactive', 'Prompt to patch for every existing file')
      .default('interactive', false)
      .array('only')
      .describe('only', 'Patch only selected files')
      .example(
        '$0 patch --force',
        'Patch all files, do not ask to overwrite files'
      )
      .example(
        '$0 patch --only tsconfig.json',
        'Patch only tsconfig.json, ask to overwrite if exists'
      ),
  /**
   * @param {import('yargs').Arguments} args
   */
  handler: patchHandler,
  describe:
    'Patch tsconfig.json and/or package.json files after changes from ts-deps.config.js or after ts-deps upgrade',
};

async function patchCli() {
  const args = patchCliModule.builder(yargs).parse();
  await patchHandler(args);
}

module.exports = {
  patch,
  patchCli,
  patchCliModule,
};
