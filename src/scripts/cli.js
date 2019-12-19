// @ts-check
import yargs, { command } from 'yargs';
import { initCliModule } from './init';
import { patchCliModule } from './patch';

command(initCliModule)
  .command(patchCliModule)
  .wrap(Math.min(120, yargs.terminalWidth()))
  .strict()
  .demandCommand(1, 1)
  .parse();
