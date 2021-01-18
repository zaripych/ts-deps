// @ts-check
import { EOL } from 'os';

const newLineRegex = /\r\n|\n/g;

/**
 * @param {{oldText?: string, newText?: string, unique: boolean}} param0
 */
export function patchText({ oldText, newText, unique }) {
  const oldLines =
    (typeof oldText === 'string' && oldText.split(newLineRegex)) || [];
  const newLines =
    (typeof newText === 'string' && newText.split(newLineRegex)) || [];

  if (oldLines.length === 0) {
    return newLines.length > 0 ? newLines.join(EOL) : '';
  }
  if (newLines.length === 0) {
    return oldText;
  }

  const set = new Set(oldLines.filter((text) => !!text));

  const result = unique
    ? [...oldLines, ...newLines.filter((line) => !set.has(line))]
    : [...oldLines, ...newLines];

  return result.join(EOL);
}
