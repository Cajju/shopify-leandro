import { useState, useEffect } from 'react'
import { Text, BlockStack, InlineStack, Banner, Page, Box } from '@shopify/polaris'
import { useNavigate } from 'react-router-dom'
import OnboardingStep from './OnboardingStep'
import useThemeSupport from '../../../rq-api/shop/useThemeSupport'
import useBundles from '../../../rq-api/bundles/useBundles'
import useShop from '../../../rq-api/shop/useShop'
import useSettings from '../../../rq-api/settings/useSettings'
import useSetSettings from '../../../rq-api/settings/useSetSettings'
import { triggerEvent } from '@components/CrispChat'

export const OnboardingBanner = () => {
  const navigate = useNavigate()
  const { data: shop } = useShop()
  const { data: themeSupport } = useThemeSupport()
  const { data: bundles } = useBundles()
  const [deepLink, setDeepLink] = useState(null)
  const { data: settings, isSuccess: isSettingsSuccess } = useSettings()
  const { mutate: setSettings } = useSetSettings()

  const isOnboardingBannerVisible = !(settings?.status?.onboardingBanner?.hideBanner ?? true)

  useEffect(() => {
    if (themeSupport) {
      // App embed deep link for settings_data.json
      setDeepLink(
        `https://${shop?.shopInformation.myshopify_domain}/admin/themes/current/editor?context=apps&template=index&activateAppId=${themeSupport.shopifyBundlesDiscountsExtensionId}/widget-app-embed`
      )
    }
  }, [themeSupport, shop?.shopInformation.myshopify_domain])

  const dismissBannerHandler = () => {
    setSettings({ settings: { 'status.onboardingBanner.hideBanner': true }, patch: true })
  }

  const isStep1Completed = bundles?.length > 0
  const isStep2Completed = themeSupport?.hasThisAppIntegrated
  const isStep3Completed = settings?.status?.onboardingBanner?.isAppWidgetTested ?? false

  useEffect(() => {
    if (
      isSettingsSuccess &&
      settings?.crisp?.events &&
      settings.crisp.events?.on_fresh_start_event !== true &&
      !isStep1Completed &&
      !isStep2Completed &&
      !isStep3Completed
    ) {
      const isSuccess = triggerEvent('boxhead_bundles__on_fresh_start_event')
      if (isSuccess) {
        window.$crisp?.push(['do', 'chat:open'])
        setSettings({ settings: { 'crisp.events.on_fresh_start_event': true }, patch: true })
      }
    }
    if (
      isSettingsSuccess &&
      settings?.crisp?.events &&
      settings.crisp.events?.on_app_install_finish !== true &&
      isStep1Completed &&
      isStep2Completed
    ) {
      const isSuccess = triggerEvent('boxhead_bundles__on_app_install_finish')
      if (isSuccess) {
        window.$crisp?.push(['do', 'chat:open'])
        setSettings({ settings: { 'crisp.events.on_app_install_finish': true }, patch: true })
      }
    }
  }, [window.$crisp, isStep1Completed, isStep2Completed, isStep3Completed, isSettingsSuccess])

  return (
    isOnboardingBannerVisible && (
      <Banner title="Welcome to Boxhead Bundles!" onDismiss={dismissBannerHandler} hideIcon>
        <BlockStack gap="200">
          <Text variant="bodyMd">Follow the steps below to create a bundle and activate the app in your store.</Text>
          <InlineStack gap="400" as="div" wrap={true} blockAlign="center" align="start">
            <OnboardingStep
              number={1}
              title="Create your first bundle"
              onClick={() => navigate('/bundles/new')}
              isCompleted={isStep1Completed}
            />

            <OnboardingStep
              number={2}
              title="Add bundle widgets to your theme"
              onClick={() => (themeSupport ? window.open(deepLink, '_blank') : null)}
              isCompleted={isStep2Completed}
            />

            <OnboardingStep
              number={3}
              title="Test the app in your store"
              onClick={() => window.open('https://www.youtube.com/watch?v=jTm_B4Eg7LU&t=193s', '_blank')}
              isCompleted={isStep3Completed}
            />
          </InlineStack>
        </BlockStack>
      </Banner>
    )
  )
}
