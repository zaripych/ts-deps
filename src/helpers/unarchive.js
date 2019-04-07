// @ts-check
const { mkdir, createReadStream } = require('fs-extra');
const { createGunzip } = require('zlib');
const { extract } = require('tar-fs');

/**
 * @param {string} tar
 * @param {string} out
 * @param {import('tar-fs').ExtractOptions} [opts]
 */
const unarchiveTarGz = async (tar, out, opts) => {
  const outPath = out;
  await mkdir(outPath).catch(() => Promise.resolve());
  const gunzip = createGunzip();
  const stream = createReadStream(tar)
    .pipe(gunzip)
    .pipe(
      extract(outPath, opts),
      { end: true }
    );
  return new Promise((res, rej) => {
    stream.once('end', () => {
      res();
    });
    stream.once('close', () => {
      res();
    });
    stream.once('finish', () => {
      res();
    });
    stream.once('error', err => {
      rej(err);
    });
  });
};

module.exports = {
  unarchiveTarGz,
};
