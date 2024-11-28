import Amplitude from 'amplitude'
import envVars from '../utils/config.js'

let amplitude

export function initAmplitude() {
  try {
    amplitude = new Amplitude(envVars.amplitudeApiKey)
  } catch (err) {
    console.log(err.message)
  }
}

export async function reportEvent(shopOrigin, eventName, eventValue, additionalProps) {
  if (!eventName) {
    console.debug('reportEvent(): no eventName/shop were provided as input')
    return
  }
  try {
    const userProps = additionalProps && additionalProps.userProps ? additionalProps.userProps : {}
    const eventProps = additionalProps && additionalProps.eventProps ? additionalProps.eventProps : {}

    const data = {
      user_id: shopOrigin || 'unknown.myshopify.com',
      event_type: eventName,
      event_properties: {
        value: eventValue,
        ...eventProps
      },
      user_properties: {
        appName: envVars.appNameHandle,
        ...userProps
      }
    }

    amplitude.track(data).catch((e) => {
      //do nothing
    })
  } catch (error) {
    console.debug(error)
  }
}
