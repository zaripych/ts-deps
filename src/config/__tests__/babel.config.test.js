const { default: config, babelConfig } = require('../babel.config')
const { validate } = require('@babel/core/lib/config/validation/options')

describe('given no options', () => {
  it('should work', () => {
    const defaultConfig = babelConfig()
    expect(defaultConfig).toMatchSnapshot()
    expect(defaultConfig).toMatchObject(config)

    expect(() => validate('configfile', defaultConfig)).not.toThrow()
  })
})

describe('given node version', () => {
  it('should work', () => {
    const cfg = babelConfig({
      nodeVersion: '10',
    })
    expect(cfg).toMatchSnapshot()

    expect(() => validate('configfile', cfg)).not.toThrow()
  })
})

describe('excluding tests in the output', () => {
  it('should work', () => {
    const cfg = babelConfig({
      ignoreTests: true,
    })
    expect(cfg).toMatchSnapshot()

    expect(() => validate('configfile', cfg)).not.toThrow()
  })
})

describe('given aliases', () => {
  it('should work', () => {
    const cfg = babelConfig({
      aliases: {
        ['@shared']: '/src/shared',
        ['@feature']: 'src/feature/',
      },
    })
    expect(cfg).toMatchSnapshot()

    expect(() => validate('configfile', cfg)).not.toThrow()
  })
})

describe('given options', () => {
  it('should work', () => {
    const cfg = babelConfig({
      aliases: {
        ['@shared']: '/src/shared/',
      },
      nodeVersion: '10',
    })
    expect(cfg).toMatchSnapshot()

    expect(() => validate('configfile', cfg)).not.toThrow()
  })
})
