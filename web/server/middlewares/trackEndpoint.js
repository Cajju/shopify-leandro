import { reportEvent } from '../../shared/utils/report-events/index.js'
import { constants } from '../../shared/utils/report-events/constants.js'

// Define allowed and prohibited paths
const ALLOWED_PATHS = ['/api/admin', '/api/widget-proxy']

const PROHIBITED_PATHS = []

const trackEndpoint = (req, res, next) => {
  const path = req.originalUrl

  // Check if path is allowed
  const isAllowed = ALLOWED_PATHS.some((allowedPath) => path.startsWith(allowedPath))

  // Check if path contains prohibited strings
  const isProhibited = PROHIBITED_PATHS.some((prohibitedPath) => path.includes(prohibitedPath))

  // Skip tracking if path is not allowed or is prohibited
  if (!isAllowed || isProhibited) {
    return next()
  }

  const startTime = Date.now()

  /**
   * Tracks an API endpoint call with timing and custom data.
   * Sets a 'tracked' flag on the response to prevent duplicate tracking.
   *
   * @param {Object} [additionalData={}] - Additional tracking data
   * @param {string} [additionalData.eventName] - Custom event name to override default API_CALLED
   *
   * @example
   * res.track({
   *   eventName: 'custom.api.event',
   *   properties: {
   *     customField: 'value',
   *     status: 'success'
   *   }
   * })
   */
  res.track = (additionalData = {}) => {
    const duration = Date.now() - startTime
    // @ts-ignore
    const shopOrigin = req.session?.shop || 'unknown.myshopify.com'
    if (shopOrigin === 'unknown.myshopify.com') {
      return
    }

    reportEvent(shopOrigin, additionalData.eventName || constants.event.app.API_CALLED, {
      path: req.originalUrl,
      method: req.method,
      duration,
      resource: req.method + ' ' + req.originalUrl,
      ...(additionalData || {})
    })

    // Set tracked flag when res.track is explicitly called
    res.tracked = true
  }

  // Store the original end method
  const originalEnd = res.end

  // Override the end method
  res.end = function (...args) {
    if (!res.tracked) {
      res.track()
    }
    return originalEnd.apply(this, args)
  }

  next()
}

export default trackEndpoint
