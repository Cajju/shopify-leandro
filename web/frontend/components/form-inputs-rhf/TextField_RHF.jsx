import { TextField } from '@shopify/polaris'
import { Controller, useController } from 'react-hook-form'

const TextField_RHF = ({ control, name, defaultValue = '', shouldUnregister = false, ...params }) => {
  const {
    field: { value, onChange, onBlur },
    fieldState
  } = useController({ control, shouldUnregister, defaultValue, name })

  return <TextField error={fieldState.error?.message} {...{ value, onChange, onBlur }} {...params} />
}

// const TextField_RHF = ({ control, name, defaultValue = '', shouldUnregister = false, ...params }) => {
//   return (
//     <>
//       <Controller
//         {...{ control, name, defaultValue, shouldUnregister }}
//         render={({ field: { value, onChange, onBlur }, fieldState }) => (
//           <TextField error={fieldState.error?.message} {...{ value, onChange, onBlur }} {...params} />
//         )}
//       />
//     </>
//   )
// }

export default TextField_RHF
