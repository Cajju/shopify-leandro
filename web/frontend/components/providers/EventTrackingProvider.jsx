import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY
const options = {
  api_host: 'https://app.posthog.com',
  autocapture: false, // Disable all automatic event capturing
  capture_pageview: true, // Keep page view tracking
  capture_pageleave: true, // Keep page leave tracking
  mask_all_text: false, // Don't mask text content
  mask_all_element_attributes: false // Don't mask element attributes
}

export const EventTrackingProvider = ({ children }) => {
  useEffect(() => {
    if (!posthogApiKey) {
      console.warn('PostHog API key is not set')
    }
  }, [])

  if (!posthogApiKey) {
    return children
  }

  return (
    <PostHogProvider apiKey={posthogApiKey} options={options}>
      {children}
    </PostHogProvider>
  )
}
