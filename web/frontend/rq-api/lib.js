/**
 * Converts a nested object into dot notation
 * @param {Object} obj - The object to flatten
 * @param {String} [prefix=''] - The prefix for the current level
 * @returns {Object} Flattened object with dot notation keys
 *
 * Example:
 * Input: { a: { b: { c: 1 } }, d: 2 }
 * Output: { 'a.b.c': 1, 'd': 2 }
 */
export const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.` : ''

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], `${pre}${key}`))
    } else {
      acc[`${pre}${key}`] = obj[key]
    }

    return acc
  }, {})
}

/**
 * Converts a dot notation object into a nested object
 * @param {Object} obj - The flattened object with dot notation
 * @returns {Object} Nested object
 *
 * Example:
 * Input: { 'a.b.c': 1, 'd': 2 }
 * Output: { a: { b: { c: 1 } }, d: 2 }
 */
export const unflattenObject = (obj) => {
  const result = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key.includes('.')) {
      const parts = key.split('.')
      let current = result

      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = current[parts[i]] || {}
        current = current[parts[i]]
      }

      current[parts[parts.length - 1]] = value
    } else {
      result[key] = value
    }
  }

  return result
}
