export function max<T>(...args: T[]): T | undefined {
  return (
    (Array.isArray(args) &&
      args.length > 0 &&
      args.reduce((acc, val) => (val > acc ? val : acc), args[0])) ||
    undefined
  );
}

export function valueOrDefault<T, D = null>(value?: T, def: D = null): T | D {
  return value ?? def;
}

export function lengthOrZero<T>(array?: T[]) {
  return array?.length ?? 0;
}
