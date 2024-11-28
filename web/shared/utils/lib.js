function omitKeys(object, keysToOmit) {
  const keysSet = new Set(keysToOmit)
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keysSet.has(key)))
}
