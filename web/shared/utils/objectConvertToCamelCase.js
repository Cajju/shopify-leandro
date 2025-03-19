// Helper function to convert snake_case to camelCase
export const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

// Recursively transform object keys
export const transformKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item))
  }
  if (obj && typeof obj === 'object') {
    const newObj = {}
    Object.keys(obj).forEach((key) => {
      const camelKey = toCamelCase(key)
      newObj[camelKey] = transformKeys(obj[key])
    })
    return newObj
  }
  return obj
}
