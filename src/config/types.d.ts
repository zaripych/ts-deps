interface IBabelConfigParams {
  aliases: IOptions['aliases'];
  nodeVersion: string;
  presetEnvConfig?: (defaultConfig: {}) => {};
}

interface IJestConfigParams {
  aliases: IOptions['aliases'];
  nodeVersion: string;
}

interface ITsConfigParams {
  aliases: IOptions['aliases'];
  baseConfigLocation: string;
}
