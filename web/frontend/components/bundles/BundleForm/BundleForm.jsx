import { Badge, BlockStack, Button, Card, InlineStack, Layout, Page, PageActions, Text } from '@shopify/polaris'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import BundleTypeSelector from './BundleTypeSelector'
import { BUNDLE_TYPES, defaultValues, STATUS_TYPES } from '@shared/utils/bundles/bundles-constants'
import bundleFormSchema from '@shared/utils/bundles/bundles-form-schema'
import VolumeDiscount from './VolumeDiscount'

const BundleForm = ({ onSubmit, initialData, isNew = true, isPending = false }) => {
  const navigate = useNavigate()

  const methods = useForm({
    defaultValues: {
      ...defaultValues,
      ...initialData
    },
    resolver: zodResolver(bundleFormSchema)
  })
  const { handleSubmit, watch, control, setValue, getValues } = methods
  const selectedBundleType = watch('bundleType')

  const saveHandler = (data, status = 'draft') => {
    data.status = status
    onSubmit({ bundleId: initialData?._id, data, onSuccess: () => navigate('/') })
  }

  // Status badge
  let statusBadge = null
  if (initialData?.status === STATUS_TYPES.ACTIVE) {
    statusBadge = <Badge tone="success">Active</Badge>
  } else if (initialData?.status === STATUS_TYPES.DRAFT) {
    statusBadge = <Badge tone="info">Draft</Badge>
  }

  // Page actions
  const pageActions = {
    primaryAction: {
      content: 'Save and activate',
      onAction: handleSubmit((data) => saveHandler(data, STATUS_TYPES.ACTIVE)),
      loading: isPending,
      disabled: isPending || !selectedBundleType
    },
    secondaryActions: (
      <InlineStack gap="100">
        <Button tone="critical" onClick={() => navigate('/')} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleSubmit((data) => saveHandler(data))}
          loading={isPending}
          disabled={isPending || !selectedBundleType}>
          Save as draft
        </Button>
      </InlineStack>
    )
  }

  return (
    <>
      <form>
        <FormProvider {...methods}>
          <Page title={isNew ? 'New bundle' : 'Edit bundle'} titleMetadata={statusBadge} {...pageActions}>
            <Layout>
              <Layout.Section>
                <BlockStack gap="400">
                  <BundleTypeSelector
                    selectedType={selectedBundleType}
                    onTypeSelect={(type) => setValue('bundleType', type)}
                  />

                  {selectedBundleType === BUNDLE_TYPES.VOLUME && <VolumeDiscount />}
                </BlockStack>
              </Layout.Section>

              {/* Preview */}
              <Layout.Section variant="oneThird">
                <Card>
                  <Text alignment="center">Bundle preview</Text>
                </Card>
              </Layout.Section>
            </Layout>
            <PageActions {...pageActions} />
          </Page>
        </FormProvider>
      </form>
    </>
  )
}

export default BundleForm
