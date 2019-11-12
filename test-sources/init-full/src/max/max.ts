export function max<T>(...args: T[]): T | undefined {
  return (
    (Array.isArray(args) &&
      args.length > 0 &&
      args.reduce((acc, val) => (val > acc ? val : acc), args[0])) ||
    undefined
  );
}

export function valueOrDefault<T>(value?: T, def: T | null = null): T | null {
  return value ?? def;
}

export function lengthOrZero<T>(array?: T[]) {
  return array?.length ?? 0;
}
