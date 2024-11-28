import { Settings, Shop, ShopInstall } from '../models/index.js'
import envVars from '../utils/config.js'
const { apiVersion, host, isProd } = envVars
import { reportEvent } from '../utils/amplitude.js'
import {
  BillingInterval,
  currencyCode,
  getPlan,
  hasActivePayment,
  requestPayment,
  cancelSubscription,
  calculateRemainDays
} from '../utils/shopify/ensure-billing.js'
import { sendPushNotification } from '../utils/push-notification.js'
import HttpError from '../utils/http-error.js'
import shopify from '../utils/shopify/index.js'
import { GraphqlQueryError } from '@shopify/shopify-api'
import { fetchProducts } from '../services/product-service.js'

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
      reportEvent(shopOrigin, 'error', {
        value: 'could not fetch shop details'
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

export async function toggleShop(req, res, next) {
  const shopOrigin = req?.session?.shop
  if (!shopOrigin) {
    return next(new HttpError('No shop Origin', 403))
  }

  try {
    const toggleShop = req.body?.toggle

    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    if (!shop) {
      reportEvent(shopOrigin, 'Shop not found', {
        value: 'could not fetch shop details'
      })
      return next(new HttpError('Shop not found', 404))
    }

    if (toggleShop) {
      // Enable shop
      const options = {
        method: 'POST',
        body: JSON.stringify({
          script_tag: {
            event: 'onload',
            src: `${host}api/widget/script?app=notify-mate`
          }
        }),
        credentials: 'include',
        headers: {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json'
        }
      }
      const response = await fetch(`https://${shopOrigin}/admin/api/${apiVersion}/script_tags.json`, options)
      const data = await response.json()
    } else {
      // Disable shop
      // get all script tags
      let response = await fetch(`https://${shopOrigin}/admin/api/${apiVersion}/script_tags.json`, {
        credentials: 'include',
        headers: {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json'
        }
      })
      let script_tags = (await response.json())?.script_tags
      if (script_tags && Array.isArray(script_tags)) {
        script_tags = script_tags.filter((item) => item.src.indexOf('app=notify-mate') > -1)

        for (const script of script_tags) {
          response = await fetch(`https://${shopOrigin}/admin/api/${apiVersion}/script_tags/${script.id}.json`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'X-Shopify-Access-Token': shop.accessToken,
              'Content-Type': 'application/json'
            }
          })
          const data = await response.json()
        }
      } else {
        const script = script_tags.script_tag
        response = await fetch(`https://${shopOrigin}/admin/api/${apiVersion}/script_tags/${script.id}.json`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
      }
    }

    await Shop.updateOne({ shopify_domain: shopOrigin }, { isActive: toggleShop })

    res.status(201).json({ success: true })
  } catch (e) {
    console.log(e)
    return next(new HttpError(`Failed to process toggleShop: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
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
      reportEvent(shopOrigin, 'error', {
        value: 'could not fetch shop details'
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
      if (isProd) {
        const title = '[Mate] App install'
        const message = `Plan: ${chargeName}, $${plan.price}`
        const link = `https://${shopOrigin}`
        await sendPushNotification(title, message, link)
        reportEvent(shopOrigin, `Change plan: ${chargeName}`, {
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
      reportEvent(shopOrigin, 'plans-payment_not_confirmed')
      res.status(201).json({ message })
    }
  } catch (e) {
    console.log(e)
    return next(new HttpError(`Failed to process ensurePayment: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}
