export function min(...args) {
  return (
    (Array.isArray(args) &&
      args.length > 0 &&
      args.reduce((min, val) => (val < min ? val : min), args[0])) ||
    undefined
  )
}
