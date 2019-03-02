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
  copyAdditional: string[]
}>

type PatchParams = Partial<{
  templatesDir: string
  forceOverwrites: boolean
  baseTsConfigLocation: string
  patchOnly: string[]
  shouldPromptToOverwritePackageJson: boolean
}>

type InitParams = Partial<{
  forceOverwrites: boolean
}>
