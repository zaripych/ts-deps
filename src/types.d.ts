interface IOptions {
  /**
   * A map between module id imported in the code
   * and relative-to-root directory location the module maps to
   */
  aliases?: {
    [moduleId: string]: string
  }

  /**
   * Minimum version of the node we want to support (defaults to 8.12)
   */
  nodeVersion?: string

  /**
   * Specify exact files to patch when `ts-deps patch` is run
   */
  patchOnly?: string[]

  /**
   * Location of the ts config we should extend from
   */
  baseTsConfigLocation?: string
}
