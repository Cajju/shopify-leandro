import React, { forwardRef } from 'react'
import { ColorPicker, Text, TextField } from '@shopify/polaris'
import { hexToHsva, hsvaToHex, addHash, cleanHexColor } from './utils/colors'
import {
  $ColorPaletteWrapper,
  $PrefixWrap,
  $PrefixColorThumbnail,
  $PrefixText,
  $ColorCircle,
  $RecommendedColorsWrapper,
  $RecommendedColorsList
} from './ColorPalette.styled'

const recommendedColors = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F0FF33',
  '#FF33F0',
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F0FF33',
  '#FF33F0',
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F0FF33',
  '#FF33F0'
]

const RecommendedColors = ({ onSelectColor }) => (
  <$RecommendedColorsWrapper>
    <Text variant="headingXs" tone="subdued">
      Recommended colors
    </Text>
    <$RecommendedColorsList>
      {recommendedColors.map((color) => (
        <$ColorCircle key={color} color={color} onClick={() => onSelectColor(color)} />
      ))}
    </$RecommendedColorsList>
  </$RecommendedColorsWrapper>
)

const ColorPalette = forwardRef(({ error, onChange, onBlur, color, ...params }, ref) => {
  const hsvaColor = hexToHsva(color)

  const handleBlur = (e, onChange, onBlur) => {
    let value = addHash(e.target.value)
    const isValidHex = /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(value)

    if (value.length === 9 && value.endsWith('ff')) {
      value = value.slice(0, 7) // Remove the 'ff' at the end
    }

    if (!e.target.value || !isValidHex) {
      onChange('#000000')
    } else {
      onChange(value)
    }

    onBlur(e)
  }

  const handleKeyDown = (e, onBlur) => {
    if (e.key === 'Enter') {
      onBlur(e)
    }
  }

  return (
    <$ColorPaletteWrapper>
      <ColorPicker
        error={error}
        onChange={(hsvaColor) => {
          console.log('HSVA Color from Picker:', hsvaColor)
          onChange(hsvaToHex(hsvaColor))
        }}
        color={hsvaColor}
        allowAlpha={true}
        {...params}
        ref={ref}
      />
      <TextField
        value={cleanHexColor(color)}
        onChange={(value) => onChange(addHash(value))}
        onBlur={(e) => handleBlur(e, onChange, onBlur)}
        prefix={
          <$PrefixWrap>
            <$PrefixColorThumbnail $color={color} />
            <$PrefixText>#</$PrefixText>
          </$PrefixWrap>
        }
        suffix="hex"
      />
      <RecommendedColors onSelectColor={onChange} />
    </$ColorPaletteWrapper>
  )
})

export default ColorPalette
