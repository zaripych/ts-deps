// @ts-check
const { emptyDir, rmdir, existsSync } = require('fs-extra');
const { join } = require('path');
const defaults = require('../defaults');

const clean = async ({
  cwd = process.cwd(),
  dirs = [defaults.libOutDir],
} = {}) => {
  const packageJson = join(cwd, 'package.json');

  if (existsSync(packageJson)) {
    const existing = dirs.filter(dir => existsSync(dir));
    if (existing.length === 0) {
      console.log('👌  clean: nothing to clean');
      return;
    }

    for (const dir of dirs) {
      const cleanPath = join(cwd, dir);

      console.log('🗑  clean: deleting', cleanPath);

      await emptyDir(cleanPath);
      await rmdir(cleanPath);
    }
  } else {
    console.log(
      '💥  clean: no package.json found, is your current directory correct?'
    );
    process.exit(-1);
  }
};

module.exports = {
  clean,
};
