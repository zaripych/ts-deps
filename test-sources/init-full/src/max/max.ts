export function max<T>(...args: T[]): T | undefined {
  return (
    (Array.isArray(args) &&
      args.length > 0 &&
      args.reduce((max, val) => (val > max ? val : max), args[0])) ||
    undefined
  )
}
