import { EmptyState, Page } from '@shopify/polaris'
import { EmptyState2Img } from '@assets'
import { useNavigate } from 'react-router-dom'
import useBundles from '@rq-api/bundles/useBundles'

import BundlesTable from '@components/bundles/BundlesTable/BundlesTable'
import ErrorBanner from '@components/ErrorBanner'
import ManageBundlesSkeleton from '@components/Bundles/BundlesTable/ManageBundlesSkeleton'

export default function ManageBundlesPage() {
  const navigate = useNavigate()

  const { data: bundles, isLoading: isLoadingBundles, isSuccess: isSuccessBundles, error: bundlesError } = useBundles()

  if (isLoadingBundles) return <ManageBundlesSkeleton />
  if (bundlesError) return <ErrorBanner message={bundlesError?.message} />

  if (isSuccessBundles && bundles.length === 0) {
    return (
      <EmptyState
        image={EmptyState2Img}
        heading="No bundles yet"
        action={{
          content: 'Create a bundle',
          onAction: () => navigate('bundles/new')
        }}>
        <p>Click below to create your first bundle</p>
      </EmptyState>
    )
  }

  return (
    <Page
      title="Bundles"
      subtitle="Create and manage your bundles."
      primaryAction={{
        content: 'Create a Bundle',
        onAction: () => navigate('bundles/new')
      }}>
      <BundlesTable />
    </Page>
  )
}
