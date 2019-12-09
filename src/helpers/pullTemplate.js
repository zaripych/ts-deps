// @ts-check
import { spawnSync } from 'child_process';
import { unarchiveTarGz } from './unarchive';
import { resolveTemplatesDir } from './helpers';
import { join, relative, isAbsolute } from 'path';
import { pathExists, unlink, stat } from 'fs-extra';

const templateDirectories = ['template', 'template-for-libs', 'template-max'];

/**
 * @param {string} depName
 * @param {string} cwd
 * @param {string} targetDir
 */
const npmPullTemplate = async (depName, cwd, targetDir) => {
  const infoProcessResult = spawnSync('npm', ['info', depName], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    cwd,
  });

  if (infoProcessResult.status !== 0) {
    throw new Error(`Couldn't find '${depName}' package in npm repository`);
  }

  const templateFullDirs = templateDirectories.map(dir => join(targetDir, dir));

  const templatePathExist = await Promise.all(
    templateFullDirs.map(dir => pathExists(dir))
  );
  const existingTemplatePath = templatePathExist.indexOf(true);
  if (existingTemplatePath >= 0) {
    throw new Error(
      `Path already exists: ${templateFullDirs[existingTemplatePath]}, it would be unsafe to pull templates to this location, please remove or backup the directory manually`
    );
  }

  const packResult = spawnSync('npm', ['pack', depName], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    cwd,
  });

  const packagePath = packResult.stdout.trim();
  const fullPackagePath = join(cwd, packagePath);

  await unarchiveTarGz(fullPackagePath, cwd, {
    map: header => {
      const name = header.name.replace('package/', '');
      return {
        ...header,
        name,
      };
    },
    ignore: (_name, headers) => {
      if (!headers) {
        return false;
      }
      return templateDirectories.every(dir => !headers.name.startsWith(dir));
    },
  });

  await unlink(fullPackagePath);

  return relative(cwd, resolveTemplatesDir(templateFullDirs));
};

/**
 * @param {string} template
 * @param {string} cwd
 * @param {string} targetDir
 * @returns {Promise<TemplateInfo>}
 */
const pullTemplates = async (template, cwd, targetDir) => {
  const templatePath = isAbsolute(template) ? template : join(cwd, template);
  const templatesStat = await stat(templatePath).catch(_err => null);

  if (templatesStat && templatesStat.isDirectory()) {
    return {
      type: 'directory',
      dir: templatePath,
    };
  }

  const result = await npmPullTemplate(template, cwd, targetDir);

  return {
    type: 'package',
    dir: join(cwd, result),
  };
};

/**
 * @param {string} [template]
 * @param {string} cwd
 * @param {string} targetDir
 * @returns {Promise<TemplateInfo[]>}
 */
const initializeTemplates = async (template, cwd, targetDir) => {
  /**
   * @type TemplateInfo
   */
  const defTemplateInfo = {
    type: 'default',
    dir: resolveTemplatesDir(),
  };

  const templateInfo = template
    ? await pullTemplates(template, cwd, targetDir)
    : defTemplateInfo;

  const templates =
    templateInfo.type !== 'default'
      ? [defTemplateInfo, templateInfo]
      : [defTemplateInfo];

  return templates;
};

export { npmPullTemplate, initializeTemplates };
