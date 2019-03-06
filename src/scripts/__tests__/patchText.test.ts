import { patchText } from '../patchText'

const comparable = (text?: string) => (text && text.split(/\r\n|\n/g)) || []

describe('patchText', () => {
  describe('given undefined', () => {
    const oldText = undefined
    const newText = undefined

    it('should work', () => {
      const result = patchText({
        oldText,
        newText,
        unique: false,
      })

      expect(comparable(result)).toEqual(comparable(''))
    })
  })

  describe('given undefined and non-empty', () => {
    const oldText = undefined
    const newText = 'line'

    it('should work', () => {
      const result = patchText({
        oldText,
        newText,
        unique: false,
      })

      expect(comparable(result)).toEqual(comparable('line'))
    })
  })

  describe('given undefined and non-empty', () => {
    const oldText = 'line'
    const newText = undefined

    it('should work', () => {
      const result = patchText({
        oldText,
        newText,
        unique: false,
      })

      expect(comparable(result)).toEqual(comparable('line'))
    })
  })

  describe('given empty lines', () => {
    const oldText = ''
    const newText = ''

    it('should work', () => {
      const result = patchText({
        oldText,
        newText,
        unique: true,
      })

      expect(comparable(result)).toEqual(comparable(`\r\n`))
    })
  })

  describe('given non empty lines', () => {
    const oldText = `line1
line2\r\n\nline3`
    const newText = `line2\nline4`

    it('should work', () => {
      const result = patchText({
        oldText,
        newText,
        unique: true,
      })

      expect(comparable(result)).toEqual(
        comparable(
          `line1
line2

line3
line4`
        )
      )
    })
  })

  describe('given non empty lines, allowing duplicates', () => {
    const oldText = `line1
line2

line3`
    const newText = `line2
line4`

    it('should work', () => {
      const result = patchText({
        oldText,
        newText,
        unique: false,
      })

      expect(comparable(result)).toEqual(
        comparable(`line1
line2

line3
line2
line4`)
      )
    })
  })
})
