import { ChoiceList } from '@shopify/polaris'
import { Controller } from 'react-hook-form'

const ChoiceList_RHF = ({ control, name, defaultValue = '', shouldUnregister = false, ...params }) => {
  return (
    <>
      <Controller
        {...{ control, name, defaultValue, shouldUnregister }}
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <ChoiceList
            error={fieldState.error?.message}
            onChange={onChange} // send value to hook form
            onBlur={onBlur} // notify when input is touched/blur
            selected={typeof value === 'string' ? [value] : value}
            {...params}
          />
        )}
      />
    </>
  )
}

export default ChoiceList_RHF
