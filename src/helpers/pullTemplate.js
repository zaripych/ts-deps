// @ts-check
const { spawnSync } = require('child_process');
const { unarchiveTarGz } = require('./unarchive');
const { resolveTemplatesDir } = require('./helpers');
const { join, relative, isAbsolute } = require('path');
const { pathExists, unlink, stat } = require('fs-extra');

const templateDirectories = ['template', 'template-max'];

/**
 * @param {string} depName
 * @param {string} cwd
 */
const npmPullTemplate = async (depName, cwd) => {
  const infoProcessResult = spawnSync('npm', ['info', depName], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    cwd,
  });

  if (infoProcessResult.status !== 0) {
    throw new Error(`Couldn't find '${depName}' package`);
  }

  const templatePathExist = await Promise.all(
    templateDirectories.map(dir => pathExists(join(cwd, dir)))
  );
  const existingTemplatePath = templatePathExist.indexOf(true);
  if (existingTemplatePath >= 0) {
    throw new Error(
      `Path already exists: ${
        templateDirectories[existingTemplatePath]
      }, it would be unsafe to pull templates to this location, please remove or backup the directory manually`
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

  return relative(
    cwd,
    resolveTemplatesDir(templateDirectories.map(dir => join(cwd, dir)))
  );
};

/**
 * @param {string} template
 * @param {string} cwd
 * @returns {Promise<TemplateInfo>}
 */
const pullTemplates = async (template, cwd) => {
  const templatePath = isAbsolute(template) ? template : join(cwd, template);
  const templatesStat = await stat(templatePath).catch(_err => null);

  if (templatesStat && templatesStat.isDirectory()) {
    return {
      type: 'directory',
      dir: templatePath,
    };
  }

  const result = await npmPullTemplate(template, cwd);

  return {
    type: 'package',
    dir: result,
  };
};

/**
 * @param {string} [template]
 * @param {string} cwd
 * @returns {Promise<TemplateInfo[]>}
 */
const initializeTemplates = async (template, cwd) => {
  /**
   * @type TemplateInfo
   */
  const defTemplateInfo = {
    type: 'default',
    dir: resolveTemplatesDir(),
  };

  const templateInfo = template
    ? await pullTemplates(template, cwd)
    : defTemplateInfo;

  const templates =
    templateInfo.type !== 'default'
      ? [defTemplateInfo, templateInfo]
      : [defTemplateInfo];

  return templates;
};

module.exports = {
  npmPullTemplate,
  initializeTemplates,
};
