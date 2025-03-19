import { useEventTracking } from '@hooks/useEventTracking'
import useSettings from '@rq-api/settings/useSettings'
import useShop from '@rq-api/shop/useShop'
import { useAppBridge } from '@shopify/app-bridge-react'
import { BlockStack, Frame, Link, Spinner, Text } from '@shopify/polaris'
import { useEffect } from 'react'
import { CrispChat } from '../CrispChat'
import { $Wrap } from './index.styled'

export const Layout = ({ children }) => {
  const { trackEvent, identifyUser, constants } = useEventTracking()
  const shopify = useAppBridge()

  const {
    data: shop,
    isLoading: isLoadingShop,
    error: errorShop,
    isSuccess: isSuccessShop,
    refetch: refetchShop
  } = useShop()

  const { data: settings, isLoading: isLoadingSettings, error: errorSettings } = useSettings()

  useEffect(() => {
    if (isSuccessShop && shop.shopInformation) {
      identifyUser(shop?.shopInformation?.myshopify_domain, {
        shopInformation: shop?.shopInformation
      })

      trackEvent({
        event: constants.event.app.APP_LOADED,
        properties: {
          shopInformation: shop?.shopInformation
        }
      })
    } else if (isSuccessShop && !shop.shopInformation) {
      refetchShop()
    }
    ;(async () => {
      // try {
      //TODO: I think it is not neccessary
      // if (settings?.subscriptionIsNotOk) {
      // 	const redirect = Redirect.create(this.context);
      // 	if (settings.paymentConfirmationUrl) {
      // 		track("show_premium_page");
      // 		redirect.dispatch(
      // 			Redirect.Action.REMOTE,
      // 			settings.paymentConfirmationUrl
      // 		);
      // 	} else {
      // 		console.log("error: missing payment confirmation url");
      // 		track("error: missing payment confirmation url");
      // 		changePlan("Pro", redirect);
      // 	}
      // }
      // } catch (e) {
      // 	console.log(`Couldn't fetch store settings`);
      // 	setFetchDataError(true);
      // }
    })()
  }, [isSuccessShop])

  useEffect(() => {
    if (isLoadingShop) {
      shopify.loading(true)
    } else {
      shopify.loading(false)
    }
  }, [shopify, isLoadingShop])

  if (errorShop) {
    console.log(errorShop)
    setTimeout(() => {
      trackEvent({
        event: constants.event.page.ERROR,
        properties: {
          error: errorShop
        }
      })
      return (
        <div
          style={{
            textAlign: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%'
          }}>
          <p>
            Hi Mate, we will be right back.
            <br />
            If you need an immidate support please contact support@zynclabs.com 🍯 (we usually respond within 15
            minutes)
          </p>
        </div>
      )
    }, 6000)
  }

  const helpdeskMarkup = (
    <>
      {/* <div style={{ height: '100px' }}></div> */}
      <div
        style={{
          marginTop: 'auto',
          textAlign: 'center',
          padding: '20px',
          width: '100%',
          flex: 'none',
          alignSelf: 'stretch'
        }}>
        <Text fontWeight="regular" as="p" variant="headingSm" tone="subdued">
          Have questions? Check out our{' '}
          <Link monochrome url="https://zynclabs.crisp.help/en/category/boxhead-bundles-12na4wy/" target="_blank">
            helpdesk
          </Link>
        </Text>
      </div>
    </>
  )

  const appInstallLoadingMarkup = (
    <div style={{ textAlign: 'center', margin: 'auto' }}>
      <BlockStack gap="200">
        <Spinner size="large" />
        <Text as="p" variant="headingSm" tone="subdued">
          Loading...
        </Text>
      </BlockStack>
    </div>
  )

  return (
    <>
      {/* Crisp Chat */}
      {import.meta.env.PROD && isSuccessShop && shop?.shopInformation && (
        <CrispChat
          APP_NAME_HANDLE={import.meta.env.VITE_CRISP_APP_NAME_HANDLE}
          CRISP_WEBSITE_ID={import.meta.env.VITE_CRISP_WEBSITE_ID}
          sessionData={{
            ...shop?.shopInformation,
            pricingPlan: shop.pricingPlan
          }}
        />
      )}
      <Frame>
        <$Wrap>
          {children}

          {helpdeskMarkup}
        </$Wrap>
      </Frame>
    </>
  )
}
