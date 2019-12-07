// @ts-check
import { command } from 'yargs';
import { initCliModule } from './init';
import { patchCliModule } from './patch';

command(initCliModule)
  .command(patchCliModule)
  .strict()
  .demandCommand(1, 1)
  .parse();
