export const addOpacityToHex = (hex, opacity) => {
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${opacityHex}`
}
