import { useParams } from 'react-router-dom'
import BundleForm from '../../components/bundles/BundleForm/BundleForm'
import useSetBundle from '@rq-api/bundles/useSetBundle'
import useBundleById from '@rq-api/bundles/useBundleById'
import BundleFormSkeleton from '@components/Bundles/BundleForm/BundleFormSkeleton'
import ErrorBanner from '../../components/ErrorBanner'

export default function BundleFormPage() {
  const { bundleId } = useParams()
  const { mutate: setBundle, isPending: isPendingSetBundle } = useSetBundle()
  const isNew = bundleId === 'new'
  const { data: bundle, isLoading, isError, error } = useBundleById(bundleId, isNew)
  if (isLoading) return <BundleFormSkeleton {...{ isNew }} />
  if (isError) return <ErrorBanner message={error?.message} />

  return (
    <>
      <BundleForm onSubmit={setBundle} initialData={bundle} isNew={isNew} isPending={isPendingSetBundle} />
    </>
  )
}
