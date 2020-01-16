declare module 'istanbul-api' {
  type CoverageMap = import('istanbul-lib-coverage').CoverageMap;

  function createReporter(): Readonly<{
    addAll(args: string[]): void;
    write(map: CoverageMap): void;
  }>;
}
