import { PostHog } from 'posthog-node'
import sharedConfig from '../config.js'

let posthog

export function initPosthog() {
  try {
    posthog = new PostHog(sharedConfig.posthog.apiKey, { host: 'https://us.i.posthog.com' })
  } catch (err) {
    console.log(err.message)
  }
}

export const performEventAction = async (data) => {
  const { eventName, properties } = data
  try {
    posthog.capture({
      distinctId: data.userId,
      event: eventName,
      properties: { ...properties, distinctId: data.userId }
    })
  } catch (err) {
    console.log(err.message)
  }
}
