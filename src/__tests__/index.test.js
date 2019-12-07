import * as index from '../index';

describe('module exports', () => {
  it('should be defined', () => {
    expect(index).toBeDefined();
    for (const k of Object.keys(index)) {
      expect(index[k]).toBeDefined();
    }
  });
});
