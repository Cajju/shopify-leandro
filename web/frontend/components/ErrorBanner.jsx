import { Banner, Page } from '@shopify/polaris'
import { useEffect } from 'react'

export default function ErrorBanner({ title = 'An error occurred', message = '' }) {
  // useEffect(() => {
  //   console.error('An error occurred:', message)
  // }, [message])

  return (
    <Page>
      <Banner title={title} tone="critical">
        <p>{message}</p>
        <p>Please contact support if the issue persists.</p>
      </Banner>
    </Page>
  )
}
