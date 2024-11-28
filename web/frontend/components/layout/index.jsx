import React, { useEffect } from 'react'
import { Frame } from '@shopify/polaris'
import { CrispChat } from '../CrispChat'
import { init as AmplitudeInit, track, identify, Identify } from '@amplitude/analytics-browser'
import { useAppBridge } from '@shopify/app-bridge-react'
import useShop from '../../rq-api/shop/useShop'

export const Layout = ({ children }) => {
  const shopify = useAppBridge()
  const {
    data: shop,
    isLoading: isLoadingShop,
    error: errorShop,
    isSuccess: isSuccessShop,
    refetch: refetchShop
  } = useShop()

  const AmplitudeEventsListener = () => {
    try {
      AmplitudeInit('624fb30d39af2b39f62049ca0a7c3d99', shop.shopInformation.myshopify_domain)
      const identifyObj = new Identify()
      identifyObj.set('appName', 'notify-mate')
      identify(identifyObj)
      // console.log("Amplitude is ready!");
    } catch (err) {
      console.log('[Error] Amplitude: ', err)
    }
  }

  useEffect(() => {
    if (isSuccessShop && shop.shopInformation) {
      AmplitudeEventsListener()
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
      track('Error getShop: ', errorShop)
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
            If you need an immidate support please contact hello@leadhive.app 🍯 (we usually respond within minutes)
          </p>
        </div>
      )
    }, 6000)
  }

  return (
    <>
      {/* Crisp Chat */}
      {import.meta.env.PROD && isSuccessShop && shop?.shopInformation && (
        <CrispChat
          CRISP_WEBSITE_ID="7a4a7f7c-7f45-4c64-a11b-0eb3a65ce81b"
          sessionData={{
            ...shop?.shopInformation,
            pricingPlan: shop.pricingPlan
          }}
        />
      )}
      <Frame>{children}</Frame>
    </>
  )
}
