const argvBefore = process.argv;
const processExitBefore = process.exit.bind(process);

describe('cli', () => {
  let fn;
  beforeAll(() => {
    process.argv = [...process.argv.slice(0, 2), '--help'];
    process.exit = fn = jest.fn();
  });

  afterAll(() => {
    process.argv = argvBefore;
    process.exit = processExitBefore;
  });

  it('should parge args', () => {
    require('../cli/ts-deps.js');
    expect(fn).toBeCalled();
  });
});
