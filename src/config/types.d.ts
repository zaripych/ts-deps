type Environments =
  | 'chrome'
  | 'opera'
  | 'edge'
  | 'firefox'
  | 'safari'
  | 'ie'
  | 'ios'
  | 'android'
  | 'node'
  | 'electron';

type Targets = {
  esmodules?: boolean;
  node?: string | 'current' | true;
  safari?: string | 'tp';
  browsers?: string | string[];
  [key in Environments]?: string;
};

interface IBabelPresetEnvConfig {
  targets?: string | Array<string> | Targets;
  spec?: boolean;
  loose?: boolean;
  modules?: 'amd' | 'umd' | 'systemjs' | 'commonjs' | 'cjs' | 'auto' | false;
  debug?: boolean;
  include?: Array<string | RegExp>;
  exclude?: Array<string | RegExp>;
  useBuiltIns?: 'usage' | 'entry' | false;
  corejs?: 2 | 3 | { version: 2 | 3; proposals: boolean };
  forceAllTransformations?: boolean;
  configPath?: string;
  ignoreBrowserslistConfig?: boolean;
  shippedProposals?: boolean;
}

interface IBabelConfigParams {
  aliases: IOptions['aliases'];
  nodeVersion: string;
  presetEnvConfig?: (
    defaultConfig: IBabelPresetEnvConfig
  ) => IBabelPresetEnvConfig;
}

interface IJestConfigParams {
  aliases: IOptions['aliases'];
  nodeVersion: string;
}

interface ITsConfigParams {
  aliases: IOptions['aliases'];
  baseConfigLocation: string;
}
