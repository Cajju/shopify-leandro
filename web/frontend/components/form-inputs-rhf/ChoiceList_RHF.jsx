import { ChoiceList } from '@shopify/polaris'
import { Controller } from 'react-hook-form'

/**
 * @type {React.FC<{
 *   control: Control,
 *   name: string,
 *   defaultValue?: string,
 *   shouldUnregister?: boolean,
 *   ...params: React.ComponentProps<typeof ChoiceList>
 * }>}
 */
const ChoiceList_RHF = ({ control, name, defaultValue = '', shouldUnregister = false, ...params }) => {
  return (
    <>
      <Controller
        {...{ control, name, defaultValue, shouldUnregister }}
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <ChoiceList
            error={fieldState.error?.message}
            onChange={(value) => onChange(value[0])} // send value to hook form
            onBlur={onBlur} // notify when input is touched/blur
            selected={[value]}
            {...params}
          />
        )}
      />
    </>
  )
}

export default ChoiceList_RHF
