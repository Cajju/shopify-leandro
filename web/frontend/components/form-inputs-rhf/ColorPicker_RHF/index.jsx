import { Popover } from '@shopify/polaris'
import { Controller } from 'react-hook-form'
import { useCallback, useState } from 'react'
import Activator from './Activator'
import ColorPalette from './ColorPalette'

const ColorPicker_RHF = ({ control, name, defaultValue = false, ...params }) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const handleColorPickerOpen = useCallback(() => {
    setIsColorPickerOpen((prev) => !prev)
  }, [isColorPickerOpen])

  return (
    <>
      <Controller
        {...{ control, name, defaultValue }}
        render={({ field: { onChange, ref, value: hexColor = '#000000', onBlur }, fieldState }) => {
          const currHexColor = hexColor || '#000000ff'
          console.log(hexColor)
          return (
            <>
              <Popover
                activator={<Activator hexColor={currHexColor} onColorPickerToggle={handleColorPickerOpen}></Activator>}
                active={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
                children={
                  <ColorPalette
                    {...{ onBlur, onChange, ref }}
                    error={fieldState.error?.message}
                    color={currHexColor}
                    {...params}
                  />
                }
              />
            </>
          )
        }}
      />
    </>
  )
}

export default ColorPicker_RHF
