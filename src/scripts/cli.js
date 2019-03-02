// @ts-check
const yargs = require('yargs')
const { initCliModule } = require('./init')
const { patchCliModule } = require('./patch')

yargs
  .command(initCliModule)
  .command(patchCliModule)
  .strict()
  .demandCommand(1, 1)
  .parse()
