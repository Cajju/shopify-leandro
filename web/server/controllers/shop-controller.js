import { Settings, Shop, ShopInstall } from '../../shared/models/index.js'
import shopifyConfig from '../../shared/utils/shopify/config.js'
import sharedConfig from '../../shared/utils/config.js'
import { reportEvent } from '../../shared/utils/report-events/index.js'
import {
  getPlan,
  hasActivePayment,
  requestPayment,
  cancelSubscription,
  calculateRemainDays
} from '../../shared/utils/shopify/ensure-billing.js'
import { sendPushNotification } from '../../shared/push-notification.js'
import HttpError from '../../shared/utils/http-error.js'
import shopify from '../../shared/utils/shopify/index.js'
import { fetchProducts, fetchProductsVariantsByIds } from '../../shared/utils/shopify/services/product-service.js'
import { checkThemeSupport, getThemeAppSettingsService } from '../../shared/utils/shopify/services/theme-service.js'
import { constants } from '../../shared/utils/report-events/constants.js'

const { BillingInterval, currencyCode } = shopifyConfig

export async function getShop(req, res, next) {
  const shopOrigin = req.session.shop

  try {
    let shop
    const RETRY_DELAY = 1000
    const MAX_RETRIES = 3
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      shop = await Shop.findOne({ shopify_domain: shopOrigin })

      if (shop && shop.shopInformation) break

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      }
    }

    if (!shop) {
      reportEvent(shopOrigin, constants.event.app.SERVER_ERROR, {
        message: 'could not fetch shop details'
      })
      return next(new HttpError('Shop not found', 404))
    }

    res.status(201).json({
      isActive: shop.isActive,
      shopInformation: shop.shopInformation,
      pricingPlan: shop.pricingPlan,
      luckyFreeStartingPlan: shop.luckyFreeStartingPlan,
      createdAt: shop.createdAt,
      temporary: {
        plan: getPlan(shop.pricingPlan)
      }
    })
  } catch (e) {
    return next(new HttpError(`Failed to process getShop: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}

export const getProducts = async (req, res, next) => {
  try {
    const result = await fetchProducts(req.session, req.query)
    res.status(200).json(result)
  } catch (e) {
    next(e)
  }
}
export const getProductsVariantsByIds = async (req, res, next) => {
  try {
    const { products } = req.body.data
    const result = await fetchProductsVariantsByIds(req.session, products)
    res.status(200).json(result)
  } catch (e) {
    next(e)
  }
}

export async function getThemeSupport(req, res, next) {
  try {
    const result = await checkThemeSupport(req.session)

    const themeSupportWithEnvVars = {
      ...result,
      shopifyBundlesDiscountsExtensionId: sharedConfig.shopifyBundlesDiscountsExtensionId
    }
    res.status(200).json(themeSupportWithEnvVars)
  } catch (e) {
    next(e)
  }
}

export async function getThemeAppSettings(req, res, next) {
  const result = await getThemeAppSettingsService(req.session)
  res.status(200).json(result)
}

export async function changePlan(req, res, next) {
  const shopOrigin = req?.session?.shop
  const accessToken = req?.session?.accessToken
  if (!shopOrigin || !accessToken) {
    return next(new HttpError('Missing ShopOrigin/ accessToken', 403))
  }

  try {
    const shop = await Shop.findOne({
      shopify_domain: shopOrigin
    })
    if (!shop) {
      reportEvent(shopOrigin, constants.event.app.SERVER_ERROR, {
        message: 'could not fetch shop details'
      })
      return next(new HttpError('Shop not found', 404))
    }

    const { plan: planName, isAnnual } = req.body

    // if (isAnnual) {
    //   const response = await (await createAnnualAppSubscription(shopOrigin, accessToken)).json();
    //   return { id: response.data?.appSubscriptionCreate?.appSubscription.id, confirmationURL: response.data?.appSubscriptionCreate?.confirmationUrl };
    // }

    if (planName === 'Basic' || planName === shop?.luckyFreeStartingPlan) {
      // Cancel subscription
      await cancelSubscription(req.session)

      if (planName === 'Basic') {
        await Settings.updateOne(
          { _id: shop._id },
          {
            'email_design.design_path': 'simple-n-easy',
            'back_in_stock.email_design.design_path': 'simple-n-easy'
          }
        )

        // Trim trial days
        const remainDays = await calculateRemainDays(shopOrigin)
        await ShopInstall.updateOne(
          { shopify_domain: shopOrigin },
          {
            $set: { cancelledAt: new Date(), trialDays: remainDays },
            $unset: { trialStartedAt: '' }
          }
        )
      }

      res.status(201).json({
        pricingPlan: planName,
        isThisLuckyFreeStartingPlan: planName === shop?.luckyFreeStartingPlan,
        temporary: {
          plan: getPlan(planName)
        }
      })
    } else {
      // Change subscription
      const plan = getPlan(planName)
      if (!plan) {
        return next(new HttpError(`Plan not found. Shop: ${shopOrigin}`, 500))
      }
      const trialDays = await calculateRemainDays(shopOrigin)
      const confirmationUrl = await requestPayment(req.session, {
        chargeName: plan.name,
        amount: plan.price,
        currencyCode: currencyCode.USD,
        interval: BillingInterval.Every30Days,
        trialDays
      })
      res.status(201).json({ confirmationUrl })
    }
  } catch (e) {
    console.log(e)
    return next(new HttpError(`Failed to process changePlan: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}

export async function ensurePayment(req, res, next) {
  const shopOrigin = req?.session?.shop
  if (!shopOrigin) {
    return next(new HttpError('No shop Origin', 403))
  }

  const chargeName = req.body?.chargeName
  if (!chargeName) {
    return next(new HttpError('Missing/ incorrect params', 403))
  }
  try {
    const hasPayment = await hasActivePayment(req.session, {
      chargeName,
      interval: BillingInterval.Every30Days
    })

    if (hasPayment) {
      await Shop.updateOne({ shopify_domain: shopOrigin }, { pricingPlan: chargeName })

      // if it's a fresh new plan do the next line
      await ShopInstall.updateOne(
        { shopify_domain: shopOrigin, trialStartedAt: { $exists: false } },
        {
          $set: {
            trialStartedAt: new Date()
          },
          $unset: { cancelledAt: '' }
        }
      )

      //send push notification
      const plan = getPlan(chargeName)
      if (sharedConfig.env !== 'dev') {
        const title = '[Mate] App install'
        const message = `Plan: ${chargeName}, $${plan.price}`
        const link = `https://${shopOrigin}`
        await sendPushNotification(title, message, link)
        reportEvent(shopOrigin, constants.event.plans.CHANGE_PRICING_PLAN, {
          plan: chargeName
        })
      }

      res.status(201).json({
        pricingPlan: chargeName,
        temporary: {
          plan
        }
      })
    } else {
      const message = `[ensurePayment] Payment is not confirmed. Shop: ${shopOrigin}`
      console.log(message)
      reportEvent(shopOrigin, constants.event.plans.PAYMENT_NOT_CONFIRMED, {
        message
      })
      res.status(201).json({ message })
    }
  } catch (e) {
    console.log(e)
    return next(new HttpError(`Failed to process ensurePayment: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}
