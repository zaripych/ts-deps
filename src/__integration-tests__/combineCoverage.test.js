// @ts-check
import { clean, combineCoverage } from '../scripts';

jest.setTimeout(120000);

describe('combineCoverage', () => {
  it('should work', async () => {
    await clean();

    await combineCoverage();
  });
});
