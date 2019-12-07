import { jestConfig } from '../jest.config';

describe('given no options', () => {
  it('should work', () => {
    const defaultConfig = jestConfig();
    expect(defaultConfig).toMatchSnapshot();
  });
});

describe('given aliases', () => {
  it('should work', () => {
    const defaultConfig = jestConfig({
      aliases: {
        ['@shared']: '/src/shared',
      },
    });
    expect(defaultConfig).toMatchSnapshot();
  });
});

describe('given integration tests', () => {
  it('should work', () => {
    const defaultConfig = jestConfig({
      isIntegrationTest: true,
    });
    expect(defaultConfig).toMatchSnapshot();
  });
});
