const flatten = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '.' : ''

    // Skip _id field completely
    if (key === '_id') {
      acc[key] = obj[key]
      return acc
    }

    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(acc, flatten(obj[key], pre + key))
    } else {
      acc[pre + key] = obj[key]
    }
    return acc
  }, {})
}

const unflatten = (obj) => {
  const result = {}
  Object.keys(obj).forEach((key) => {
    const parts = key.split('.')
    let target = result

    while (parts.length > 1) {
      const part = parts.shift()
      target = target[part] = target[part] || {}
    }
    target[parts[0]] = obj[key]
  })
  return result
}

const deepMerge = (old, newObj) => {
  if (!newObj) return old
  if (!old) return newObj

  // Flatten both objects
  const flatOld = flatten(old)
  const flatNew = flatten(newObj)

  // Merge flattened objects
  const merged = { ...flatOld }
  Object.keys(flatNew).forEach((key) => {
    if (flatNew[key] !== undefined) {
      merged[key] = flatNew[key]
    }
  })

  // Unflatten the result
  return unflatten(merged)
}

export default deepMerge
