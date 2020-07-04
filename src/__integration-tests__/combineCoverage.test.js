// @ts-check
import { clean, combineCoverage } from '../scripts';

jest.setTimeout(120000);

describe('combineCoverage', () => {
  beforeAll(async () => {
    await clean();
  });

  it('should work', () => {
    expect(() => {
      combineCoverage();
    }).not.toThrow();
  });
});
