type BabelBuildParams = Partial<{
  overrideWithCommandLineArguments: boolean;
  doNotOutputTests: boolean;
  logCommandLine: boolean;
  exitOnCompletion: boolean;
  extensions: string[];
  outDir: string;
  rootDir: string;
  unitTestsGlob: string;
  integrationTestsGlob: string;
  copyAdditional: string[];
}>;

type PatchParams = Partial<{
  templatesDir: string;
  forceOverwrites: boolean;
  aggressive: boolean;
  baseTsConfigLocation: string;
  patchOnly: string[];
  shouldPromptToOverwritePackageJson: boolean;
  cwd: string;
}>;

type InitParams = Partial<{
  forceOverwrites: boolean;
  cwd: string;
}>;

type PatchPackageJson = Partial<{
  name: string;
  version: string;
  dependencies: {
    [key: string]: string | undefined;
  };
  devDependencies: {
    [key: string]: string | undefined;
  };
  [key: string]: unknown;
}>;

type PatchCoreOptions = {
  aggressive: boolean;
};

type CombineCoverageParams = {
  cwd: string;
};
