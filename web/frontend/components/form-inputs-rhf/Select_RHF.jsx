import { Select } from '@shopify/polaris'
import { Controller } from 'react-hook-form'

const Select_RHF = ({ control, name, defaultValue = '', ...params }) => {
  return (
    <>
      <Controller
        {...{ control, name }}
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <Select error={fieldState.error?.message} {...{ value, onBlur, onChange }} {...params} />
        )}
      />
    </>
  )
}

export default Select_RHF
