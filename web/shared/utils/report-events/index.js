import sharedConfig from '../config.js'
import { initPosthog, performEventAction } from './posthog.js'

export const initEventTracking = () => {
  initPosthog()
}

/**
 * Reports an event to the analytics system
 * @param {string} shopOrigin - The Shopify store domain (e.g., 'my-store.myshopify.com')
 * @param {string} eventName - The name of the event to report
 * @param {Object} eventProperties - Properties associated with the event
 * @param {string} [eventProperties.resource] - The resource associated with the event
 * @param {Object} [eventProperties...] - Any additional properties
 * @returns {Promise<void>}
 */
export async function reportEvent(shopOrigin, eventName, eventProperties) {
  if (!eventName || !shopOrigin) {
    console.debug('reportEvent(): no eventName/shop were provided as input')
    return
  }
  try {
    const data = {
      userId: shopOrigin || 'unknown.myshopify.com',
      eventName,
      properties: { ...eventProperties, appName: `shopify-${sharedConfig.appNameHandle}-app` }
    }

    performEventAction(data)
  } catch (error) {
    console.debug(error)
  }
}
