const index = require('../index');

describe('module exports', () => {
  it('should be defined', () => {
    for (const k of Object.keys(index)) {
      expect(index[k]).toBeDefined();
    }
  });
});
