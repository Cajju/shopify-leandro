/* eslint-disable no-param-reassign */
/* eslint-disable prefer-template */
/* eslint-disable id-length */

export function RGBtoHEX(r, g, b) {
  if (arguments.length === 1) {
    g = r.g
    b = r.b
    r = r.r
  }
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export function HEXToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export function HSVtoRGB(h, s, v) {
  if (arguments.length === 1) {
    s = h.s
    v = h.v
    h = h.h
  }
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  let r
  let g
  let b
  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) {
    g = r.g
    b = r.b
    r = r.r
  }
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const s = max === 0 ? 0 : d / max
  const v = max / 255

  let h

  switch (max) {
    case min:
      h = 0
      break
    case r:
      h = g - b + d * (g < b ? 6 : 0)
      h /= 6 * d
      break
    case g:
      h = b - r + d * 2
      h /= 6 * d
      break
    case b:
      h = r - g + d * 4
      h /= 6 * d
      break
  }

  return { h, s, v }
}

export function RGBToHSL(r, g, b) {
  if (arguments.length === 1) {
    g = r.g
    b = r.b
    r = r.r
  }

  // Make r, g, and b fractions of 1
  r /= 255
  g /= 255
  b /= 255

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b)
  const cmax = Math.max(r, g, b)
  const delta = cmax - cmin
  let h = 0
  let s = 0
  let l = 0

  // Calculate hue
  // No difference
  if (delta === 0) {
    h = 0
  } else if (cmax === r) {
    // Red is max
    h = ((g - b) / delta) % 6
  } else if (cmax === g) {
    // Green is max
    h = (b - r) / delta + 2
  } else {
    // Blue is max
    h = (r - g) / delta + 4
  }

  h = Math.round(h * 60)

  // Make negative hues positive behind 360°
  if (h < 0) {
    h += 360
  }

  // Calculate lightness
  l = (cmax + cmin) / 2

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  // Multiply l and s by 100
  s = Number((s * 100).toFixed(1))
  l = Number((l * 100).toFixed(1))

  return { h, s, l }
}

const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)

const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, 'g'))

const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16)

const getAlphafloat = (a, alpha) => {
  if (typeof a !== 'undefined') {
    return a / 256
  }
  if (typeof alpha !== 'undefined') {
    if (1 < alpha && alpha <= 100) {
      return alpha / 100
    }
    if (0 <= alpha && alpha <= 1) {
      return alpha
    }
  }
  return 1
}

export const hexToRGBA = (hex, alpha) => {
  if (!isValidHex(hex)) {
    return hex
  }
  const chunkSize = Math.floor((hex.length - 1) / 3)
  const hexArr = getChunksFromString(hex.slice(1), chunkSize)
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
  return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`
}

export const shadeColor = (color, percent) => {
  var R = parseInt(color.substring(1, 3), 16)
  var G = parseInt(color.substring(3, 5), 16)
  var B = parseInt(color.substring(5, 7), 16)

  R = parseInt((R * (100 + percent)) / 100)
  G = parseInt((G * (100 + percent)) / 100)
  B = parseInt((B * (100 + percent)) / 100)

  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255

  var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16)
  var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16)
  var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16)

  return '#' + RR + GG + BB
}

export function hexToHsva(hex) {
  // Default alpha value
  let alpha = 1

  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16)
    g = parseInt(hex[3] + hex[4], 16)
    b = parseInt(hex[5] + hex[6], 16)
  } else if (hex.length === 9) {
    r = parseInt(hex[1] + hex[2], 16)
    g = parseInt(hex[3] + hex[4], 16)
    b = parseInt(hex[5] + hex[6], 16)
    alpha = parseInt(hex[7] + hex[8], 16) / 255
  }

  // Convert RGB to HSV
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    v = max

  const d = max - min
  s = max === 0 ? 0 : d / max

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  // Convert to 0-100 range
  h = Math.round(h * 360) // Hue is typically in the range of 0-360
  s = Math.round(s * 100)
  v = Math.round(v * 100)

  return {
    hue: h,
    saturation: s / 100,
    brightness: v / 100,
    alpha: alpha
  }
}

export function hsvaToHex({ hue, saturation, brightness, alpha = 1 }) {
  let r, g, b
  const i = Math.floor(hue / 60)
  const f = hue / 60 - i
  const p = brightness * (1 - saturation)
  const q = brightness * (1 - f * saturation)
  const t = brightness * (1 - (1 - f) * saturation)

  switch (i % 6) {
    case 0:
      ;(r = brightness), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = brightness), (b = p)
      break
    case 2:
      ;(r = p), (g = brightness), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = brightness)
      break
    case 4:
      ;(r = t), (g = p), (b = brightness)
      break
    case 5:
      ;(r = brightness), (g = p), (b = q)
      break
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const rHex = toHex(r)
  const gHex = toHex(g)
  const bHex = toHex(b)
  const aHex = toHex(alpha)

  return `#${rHex}${gHex}${bHex}${aHex}`
}

// Function to remove the '#' sign from a hex string
export function removeHash(hex) {
  return hex.startsWith('#') ? hex.slice(1) : hex
}

// Function to add the '#' sign to a hex string if it's not present
export function addHash(hex) {
  return hex.startsWith('#') ? hex : `#${hex}`
}

export const cleanHexColor = (color) => {
  let cleanColor = removeHash(color)
  if (cleanColor.length === 8 && cleanColor.endsWith('ff')) {
    cleanColor = cleanColor.slice(0, 6) // Remove the 'ff' at the end
  }
  return cleanColor
}
