declare module 'istanbul-api' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type CoverageMap = import('istanbul-lib-coverage').CoverageMap;

  function createReporter(): Readonly<{
    addAll(args: string[]): void;
    write(map: CoverageMap): void;
  }>;
}
