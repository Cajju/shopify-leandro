import { useController } from 'react-hook-form'
import { TextField } from './form-inputs-polaris'
/**
 * @type {React.FC<{
 *   control: Control,
 *   name: string,
 *   defaultValue?: string,
 *   shouldUnregister?: boolean,
 *   eventName?: string | string[],
 * } & React.ComponentProps<typeof TextField>}
 */
const TextField_RHF = ({ control, name, defaultValue = '', shouldUnregister = false, noError = false, ...params }) => {
  const {
    field: { value, onChange, onBlur },
    fieldState
  } = useController({ control, shouldUnregister, defaultValue, name })

  return (
    <TextField
      error={fieldState.error?.message}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      eventName={name}
      noError={noError}
      {...params}
    />
  )
}

export default TextField_RHF
