export function max<T>(...args: T[]): T | undefined {
  return (
    (Array.isArray(args) &&
      args.length > 0 &&
      args.reduce((acc, val) => (val > acc ? val : acc), args[0])) ||
    undefined
  )
}
