import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'
import { constants } from '@shared/utils/report-events/constants'

export const useEventTracking = () => {
  const posthog = usePostHog()
  const identifyUser = useCallback(
    (userId, userProperties = {}) => {
      try {
        if (!posthog) {
          console.warn('PostHog not initialized')
          return
        }

        if (userId) {
          posthog.identify(userId, userProperties)
        }
      } catch (error) {
        console.error('Error identifying user:', error)
      }
    },
    [posthog]
  )

  const trackEvent = useCallback(
    ({ event, properties = {}, resource = null }) => {
      try {
        if (!posthog) {
          console.warn('PostHog not initialized')
          return
        }

        if (!event) {
          console.warn('No event name provided')
          return
        }

        const formattedResource = Array.isArray(resource) ? resource.join(', ') : resource
        posthog.capture(event, { ...properties, resource: formattedResource })
      } catch (error) {
        console.error('Error tracking event:', error)
      }
    },
    [posthog]
  )

  return { trackEvent, identifyUser, constants }
}
