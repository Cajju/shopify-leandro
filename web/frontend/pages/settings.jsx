import PageBanners from '@components/layout/PageBanners'
import { SaveBar, useAppBridge } from '@shopify/app-bridge-react'
import { BlockStack, Card, FormLayout, Page, Text } from '@shopify/polaris'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TextField } from '../components/form-inputs-rhf'
import TooltipHelpLabel from '../components/form-inputs-rhf/TooltipHelpText'
import { useEventTracking } from '../hooks/useEventTracking'
import useSetSettings from '../rq-api/settings/useSetSettings'
import useSettings from '../rq-api/settings/useSettings'

export default function Settings() {
  const shopify = useAppBridge()
  const { data: settings } = useSettings()
  const { mutate: setSettings, isLoading, isPending } = useSetSettings()
  const { trackEvent, constants } = useEventTracking()

  const {
    control,
    formState: { errors, isDirty, dirtyFields },
    handleSubmit,
    watch,
    reset
  } = useForm({
    defaultValues: { ...settings }
  })

  useEffect(() => {
    if (settings) {
      reset({ ...settings })
      trackEvent({
        event: constants.event.page.LOADED,
        properties: {
          hasSettings: !!settings
        },
        resource: 'settings'
      })
    }
  }, [settings, reset, trackEvent, constants])

  const handleDiscard = () => {
    reset()
    shopify.saveBar.hide('settings-save-bar')
  }

  const handleSave = async (data) => {
    try {
      const dirtyData = Object.keys(dirtyFields).reduce((acc, key) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.')
          acc[parent] = acc[parent] || {}
          acc[parent][child] = data[parent][child]
        } else {
          acc[key] = data[key]
        }
        return acc
      }, {})

      setSettings({
        settings: dirtyData,
        patch: true,
        onSuccess: () => {
          reset(data)
          shopify.saveBar.hide('settings-save-bar')
          shopify.toast.show('Settings saved')
        }
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText('<boxhead-bundles></boxhead-bundles>')
      .then(() => {
        shopify.toast.show('Copied to clipboard')
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  return (
    <>
      <Page title="Settings">
        <BlockStack gap="200">
          <PageBanners />
          <Card>
            <BlockStack gap="400">
              <FormLayout>
                <Text as="h2" variant="headingMd">
                  Global texts
                </Text>

                <FormLayout.Group condensed>
                  <TextField
                    control={control}
                    name="global.total"
                    label={
                      <TooltipHelpLabel
                        label="Total"
                        helpText="The total text shows as the price summary in the build your bundle and bundle widgets"
                      />
                    }
                    placeholder="Total"
                  />
                  <TextField
                    control={control}
                    name="global.outOfStock"
                    label={
                      <TooltipHelpLabel
                        label="Out of stock"
                        helpText="Out of stock text will show inside the add to cart button in case the customer selected an out of stock product"
                      />
                    }
                    placeholder="Out of stock"
                  />
                </FormLayout.Group>

                <FormLayout.Group condensed>
                  <TextField
                    control={control}
                    name="global.viewDetails"
                    label={
                      <TooltipHelpLabel
                        label="View details button"
                        helpText="View details button shows inside the bundle banner and build your bundle pop up."
                      />
                    }
                    placeholder="View details"
                  />{' '}
                </FormLayout.Group>

                <Text as="h2" variant="headingMd">
                  Volume discount
                </Text>
                <FormLayout.Group condensed>
                  <TextField
                    control={control}
                    name="volumeDiscount.saveBanner"
                    label={
                      <TooltipHelpLabel
                        label="Save banner"
                        helpText="Use {discount_amount} to show the $ value, use {discount_percent} to show the % value."
                      />
                    }
                    placeholder="SAVE {discount_amount}"
                  />
                  <TextField
                    control={control}
                    name="volumeDiscount.pricePerUnit"
                    label={
                      <TooltipHelpLabel
                        label="Price per unit"
                        helpText="This text shows after an individual product price"
                      />
                    }
                    placeholder="each"
                  />
                </FormLayout.Group>
              </FormLayout>
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>
      <SaveBar id="settings-save-bar" open={isDirty}>
        <button variant="primary" onClick={handleSubmit(handleSave)} {...(isPending && { loading: '' })}></button>
        <button onClick={handleDiscard} {...(isPending && { disabled: 'true' })}></button>
      </SaveBar>
    </>
  )
}
