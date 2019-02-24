interface IOptions {
  /**
   * A map between module id imported in the code
   * and relative-to-root directory location the module maps to
   */
  aliases?: {
    [moduleId: string]: string
  }

  /**
   * Minimum version of the node we want to support
   */
  nodeVersion?: string
}
