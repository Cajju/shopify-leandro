import { useEventTracking } from '@hooks/useEventTracking'
import { Page, Layout, Card, EmptyState } from '@shopify/polaris'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import PageBanners from '@components/layout/PageBanners'

export default function ManageBundlesPage() {
  const navigate = useNavigate()
  const { trackEvent, constants } = useEventTracking()

  // Track page load when data is successfully loaded
  useEffect(() => {
    trackEvent({
      event: constants.event.page.LOADED,
      properties: {},
      resource: 'dashboard'
    })
  }, [trackEvent, constants])

  return (
    <>
      <Page>
        <PageBanners />
      </Page>
      <Page
        title="Dashboard"
        subtitle="Create and manage your bundles."
        primaryAction={{
          content: 'Create a Bundle',
          onAction: () => navigate('/bundles/new')
        }}>
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="Create your first bundle"
                action={{
                  content: 'Create Bundle',
                  onAction: () => navigate('/bundles/new')
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                <p>Start creating product bundles to offer deals to your customers.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  )
}
