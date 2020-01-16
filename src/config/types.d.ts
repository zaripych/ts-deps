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

interface BabelPresetEnvConfig {
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

interface BabelConfigParams {
  aliases: Options['aliases'];
  nodeVersion: string;
  presetEnvConfig?: (
    defaultConfig: BabelPresetEnvConfig
  ) => BabelPresetEnvConfig;
}

interface JestConfigParams {
  aliases: Options['aliases'];
  nodeVersion: string;
}

interface TsConfigParams {
  aliases: Options['aliases'];
  baseConfigLocation: string;
}

interface EsLintConfigParams {
  env?: Record<string, boolean>;
  extends?: string[];
  ignorePatterns?: string[];
  parserOptions?: object;
  rules?: object;
  [key: string]: unknown;
}

interface EsLintConfig {
  root?: EsLintConfigParams;
  src?: EsLintConfigParams;
}
