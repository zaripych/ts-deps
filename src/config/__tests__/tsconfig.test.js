const { tsConfig } = require('../tsconfig')

describe('given no options', () => {
  it('should work', () => {
    const defaultConfig = tsConfig()
    expect(defaultConfig).toMatchSnapshot()
  })
})

describe('given options', () => {
  it('should work', () => {
    const defaultConfig = tsConfig({
      aliases: {
        '@shared': '../../long/path/src',
      },
      baseConfigLocation: 'node_modules/my-custom-lib/tsconfig.json',
    })
    expect(defaultConfig).toMatchSnapshot()
  })
})
