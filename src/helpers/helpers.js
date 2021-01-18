// @ts-check
import { resolve, basename } from 'path';
import { existsSync } from 'fs-extra';
import { prompt } from 'inquirer';

/**
 * @param {string} str
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} str
 * @param {string} character
 */
function trimLeft(str, character) {
  let charPrefixLength = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char !== character) {
      charPrefixLength = i;
      break;
    }
  }

  return charPrefixLength ? str.substr(charPrefixLength) : str;
}

/**
 * @param {string} str
 * @param {string} character
 */
function trimRight(str, character) {
  let charSuffixLength = 0;

  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];

    if (char !== character) {
      break;
    } else {
      charSuffixLength += 1;
    }
  }

  return charSuffixLength ? str.substr(0, str.length - charSuffixLength) : str;
}

/**
 * @param {string} str
 * @param {string} character
 */
function trim(str, character) {
  return trimRight(trimLeft(str, character), character);
}

/**
 * @param {string} str
 * @param {string} preferred
 */
function ensureSamePathSeparator(str, preferred = '/') {
  const regex = /\\|\//g;
  const result = str.replace(regex, preferred);
  return result;
}

/**
 * @param {string} p
 * @param {string} sep
 */
function ensureStartsWithPathSeparator(p, sep = '/') {
  const tested = ensureSamePathSeparator(p, sep);
  return tested.startsWith(sep) ? tested : `${sep}${tested}`;
}

/**
 * @param {string} p
 * @param {string} sep
 */
function ensureEndsWithPathSeparator(p, sep = '/') {
  const tested = ensureSamePathSeparator(p, sep);
  return tested.endsWith(sep) ? tested : `${tested}${sep}`;
}

/**
 * @param {string} p
 * @param {string} sep
 */
function trimPathSeparator(p, sep = '/') {
  const tested = ensureSamePathSeparator(p, sep);

  return trim(tested, sep);
}

/**
 * @param {string} p
 * @param {string} sep
 */
function ensureSurroundedWithPathSeparator(p, sep = '/') {
  const tested = ensureSamePathSeparator(p, sep);

  return `${sep}${trim(tested, sep)}${sep}`;
}

/**
 * @param {string[]} [candidates]
 */
function resolveTemplatesDir(candidates) {
  const templatesCandidates = candidates || [
    resolve(__dirname, '../../template-for-libs'),
  ];

  const templatesDir = templatesCandidates.find((cnd) => existsSync(cnd));
  if (!templatesDir) {
    throw new Error('Cannot find templates directory');
  }

  return templatesDir;
}

const copyPromptState = {
  overwriteAll: false,
};

/**
 * @param {{ overwrite: boolean | 'a' | 'c' }} result
 */
const handleCopyPromptResult = (result) => {
  if (result.overwrite === 'a') {
    copyPromptState.overwriteAll = true;
    return Promise.resolve(true);
  }

  if (result.overwrite === 'c') {
    process.exit(0);
  }

  if (typeof result.overwrite !== 'boolean') {
    throw new Error('Expected boolean as result of prompt');
  }

  return Promise.resolve(result.overwrite);
};

/**
 * @param {string} dest
 */
const promptForOverwrite = async (dest) => {
  if (copyPromptState.overwriteAll) {
    return Promise.resolve(true);
  }

  const fileName = basename(dest);

  const result = await prompt([
    {
      name: 'overwrite',
      message: `destination file "${fileName}" already exists, overwrite?`,
      type: 'expand',
      choices: [
        { name: 'Overwrite', value: true, key: 'y' },
        { name: 'Skip', value: false, key: 'n' },
        { name: 'Overwrite all files', value: 'a', key: 'a' },
        {
          name: 'Cancel (or just press Ctrl + C)',
          value: 'c',
          key: 'c',
        },
      ],
      default: true,
    },
  ]);

  return handleCopyPromptResult(result);
};
promptForOverwrite.state = copyPromptState;

export {
  trim,
  trimLeft,
  trimRight,
  escapeRegExp,
  trimPathSeparator,
  ensureSamePathSeparator,
  ensureStartsWithPathSeparator,
  ensureEndsWithPathSeparator,
  ensureSurroundedWithPathSeparator,
  resolveTemplatesDir,
  promptForOverwrite,
};
