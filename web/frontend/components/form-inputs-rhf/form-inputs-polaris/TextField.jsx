import { TextField as PolarisTextField } from '@shopify/polaris'
import { useEventTracking } from '@hooks/useEventTracking'

/**
 * @type {React.FC<{
 *   children: React.ReactNode,
 *   eventName?: string | string[]
 * } & React.ComponentProps<typeof PolarisTextField>>}
 */
const TextField = ({ children, eventName, noError, ...props }) => {
  const { trackEvent, constants } = useEventTracking()

  const handleBlur = (e) => {
    if (eventName) {
      trackEvent({
        event: constants.event.interaction.TEXTFIELD_CHANGED,
        resource: eventName
      })
    }

    // Call original onClick if provided
    props.onBlur?.(e)
  }
  let error
  if (noError && props.error) error = ' '
  else if (props.error) error = props.error

  return (
    <PolarisTextField {...props} error={error} onBlur={handleBlur}>
      {children}
    </PolarisTextField>
  )
}

export default TextField
