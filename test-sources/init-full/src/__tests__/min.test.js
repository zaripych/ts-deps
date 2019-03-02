import { min } from '@min'

describe('min', () => {
  it('should work', () => {
    expect(min(1, 2, 3, 4)).toBe(1)
    expect(min(3, 18, -45)).toBe(-45)
    expect(min(3)).toBe(3)
    expect(min()).toBe(undefined)
  })
})
