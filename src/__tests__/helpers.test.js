const {
  escapeRegExp,
  ensureSurroundedWithPathSeparator,
  ensureStartsWithPathSeparator,
  ensureEndsWithPathSeparator,
  ensureSamePathSeparator,
  trim,
} = require('../helpers')

describe('escapeRegExp', () => {
  it('should work', () => {
    expect(escapeRegExp('()[]')).toBe('\\(\\)\\[\\]')
  })
})

describe('trim', () => {
  describe('given empty string', () => {
    const input = ''

    it('should work', () => {
      expect(trim(input, 'x')).toBe('')
    })
  })

  describe('given non-string', () => {
    const input = null

    it('should work', () => {
      expect(() => trim(input, 'y')).toThrow()
    })
  })

  describe('given text that requires no trimming', () => {
    it('should work', () => {
      expect(trim('xyyyyyx', 'y')).toBe('xyyyyyx')
    })
  })

  describe('given text that requires trimming at the start', () => {
    it('should work', () => {
      expect(trim('XyyyXy', 'X')).toBe('yyyXy')
    })
  })

  describe('given text that requires trimming at the end', () => {
    it('should work', () => {
      expect(trim('yXyyyX', 'X')).toBe('yXyyy')
    })
  })

  describe('given text that requires trimming', () => {
    it('should work', () => {
      expect(trim('XyyXyyX', 'X')).toBe('yyXyy')
    })
  })
})

describe('ensureSurroundedWithPathSeparator', () => {
  it('should work', () => {
    expect(ensureSurroundedWithPathSeparator('this/is/a/path')).toBe(
      '/this/is/a/path/'
    )
    expect(ensureSurroundedWithPathSeparator('C:\\this\\is/a/path')).toBe(
      '/C:/this/is/a/path/'
    )
    expect(ensureSurroundedWithPathSeparator('\\this/is/a\\path')).toBe(
      '/this/is/a/path/'
    )
  })
})

describe('ensureEndsWithPathSeparator', () => {
  it('should work', () => {
    expect(ensureEndsWithPathSeparator('this/is/a/path')).toBe(
      'this/is/a/path/'
    )
    expect(ensureEndsWithPathSeparator('C:\\this\\is/a/path')).toBe(
      'C:/this/is/a/path/'
    )
    expect(ensureEndsWithPathSeparator('\\this/is/a\\path')).toBe(
      '/this/is/a/path/'
    )
    expect(ensureEndsWithPathSeparator('\\this/is/a\\path/')).toBe(
      '/this/is/a/path/'
    )
  })
})

describe('ensureStartsWithPathSeparator', () => {
  it('should work', () => {
    expect(ensureStartsWithPathSeparator('this/is/a/path')).toBe(
      '/this/is/a/path'
    )
    expect(ensureStartsWithPathSeparator('C:\\this\\is/a/path')).toBe(
      '/C:/this/is/a/path'
    )
    expect(ensureStartsWithPathSeparator('\\this/is/a\\path')).toBe(
      '/this/is/a/path'
    )
    expect(ensureStartsWithPathSeparator('\\this/is/a\\path/')).toBe(
      '/this/is/a/path/'
    )
  })
})

describe('ensureSamePathSeparator', () => {
  it('should work', () => {
    expect(ensureSamePathSeparator('this/is\\a/path\\')).toBe('this/is/a/path/')
  })
})
