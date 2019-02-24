type BabelBuildParams = Partial<{
  overrideWithCommandLineArguments: boolean
  doNotOutputTests: boolean
  logCommandLine: boolean
  exitOnCompletion: boolean
  extensions: string[]
  outDir: string
  rootDir: string
  unitTestsGlob: string
  integrationTestsGlob: string
}>
