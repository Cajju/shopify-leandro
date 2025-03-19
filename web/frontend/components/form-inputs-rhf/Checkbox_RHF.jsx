import { Checkbox } from '@shopify/polaris'
import { Controller } from 'react-hook-form'

/**
 * @type {React.FC<{
 *   control: Control,
 *   name: string,
 *   defaultValue?: boolean,
 *   ...params: React.ComponentProps<typeof Checkbox>
 * }>}
 */
const Checkbox_RHF = ({ control, name, defaultValue = false, ...params }) => {
  return (
    <>
      <Controller
        {...{ control, name, defaultValue }}
        render={({ field: { onChange, ref, value, onBlur }, fieldState }) => (
          <Checkbox error={fieldState.error?.message} {...{ onChange, onBlur, ref }} checked={value} {...params} />
        )}
      />
    </>
  )
}

export default Checkbox_RHF
