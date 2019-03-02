import { max } from '@max'

describe('max', () => {
  it('should work', () => {
    expect(max(1, 2, 3, 4)).toBe(4)
    expect(max(3, 18, -45)).toBe(18)
    expect(max(3)).toBe(3)
    expect(max()).toBe(undefined)
  })
})
