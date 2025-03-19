import { Button as PolarisButton } from '@shopify/polaris'
import { useEventTracking } from '@hooks/useEventTracking'

/**
 * @type {React.FC<{
 *   children: React.ReactNode,
 *   eventName?: string | string[]
 * } & React.ComponentProps<typeof PolarisButton>>}
 */
const Button = ({ children, eventName, ...props }) => {
  const { trackEvent, constants } = useEventTracking()

  const handleClick = (e) => {
    if (eventName) {
      trackEvent({
        event: constants.event.interaction.BUTTON_CLICKED,
        resource: eventName
      })
    }

    // Call original onClick if provided
    props.onClick?.(e)
  }

  return (
    <PolarisButton {...props} onClick={handleClick}>
      {children}
    </PolarisButton>
  )
}

export default Button
