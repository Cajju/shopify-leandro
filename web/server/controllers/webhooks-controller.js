import envVars from '../utils/config.js'
const { isProd } = envVars
import { Settings, Shop, ShopInstall, Statistics } from '../models/index.js'
import { revokeSenderSignaturePostmark } from '../utils/sendEmailPostmarkapp.js'
import { reportEvent } from '../utils/amplitude.js'
import { getPlan, calculateRemainDays } from '../utils/shopify/ensure-billing.js'
import { sendPushNotification } from '../utils/push-notification.js'
import { createAppDataMetafield, fetchAppInstallationMetafield } from '../services/metafield-service.js'
import getSession from '../utils/shopify/get-session.js'
import { BUNDLE_TYPES } from '../../shared/utils/bundles/bundles-constants.js'

export const appUninstall = async (shopOrigin, body) => {
  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin })

    await ShopInstall.updateOne({ shopify_domain: shopOrigin }, { $set: { cancelledAt: new Date() } })

    console.debug(`❌ deleting shop: ${shopOrigin}`)
    await Shop.deleteOne({
      shopify_domain: shopOrigin
    })
    console.debug(`❌ deleting settings for shop: ${shopOrigin}`)

    await Settings.deleteOne({ shopify_domain: shopOrigin })
    console.debug(`🙌 succesfuly uninstalled notify mate app for ${shopOrigin}}`)

    await Statistics.deleteMany({ shopId: shop._id })
    console.debug(`🙌 succesfuly deleted stats for ${shopOrigin}`)

    await Notify.deleteMany({ shop_id: shop._id })
    console.debug(`🙌 succesfully deleted notifications for ${shopOrigin}`)

    // Trim trial days
    const remainDays = await calculateRemainDays(shopOrigin)
    await ShopInstall.updateOne(
      { shopify_domain: shopOrigin },
      { $set: { cancelledAt: new Date(), trialDays: remainDays } }
    )

    reportEvent(shopOrigin, 'uninstall')
  } catch (error) {
    console.debug(`Faced an error when uninstalling app from: ${shopOrigin}, error: ${error}`)
    reportEvent(shopOrigin, 'error', {
      value: 'uninstall',
      message: error.message
    })
  }
}

export const shopUpdate = async (shopOrigin, body) => {
  let shop
  try {
    const newShopInformation = body

    if (shopOrigin && newShopInformation) {
      shop = await Shop.findOne({ shopify_domain: shopOrigin })
      if (!shop) {
        reportEvent(shopOrigin, 'error', {
          value: 'shop_not_found_process_update_shop'
        })
        return
      }
      const oldCurrency = shop.shopInformation?.currency
      const newCurrency = newShopInformation.currency
      if (oldCurrency && oldCurrency !== newCurrency) {
        let currencyConverter = new CC({ from: oldCurrency, to: newCurrency })
        const exRate = await currencyConverter.rates()
        console.log(`Currency changed from ${oldCurrency} to ${newCurrency}, exchange rate: ${exRate}`)

        const response = await Statistics.aggregate([
          { $match: { shopId: shop._id } },
          { $set: { statistics: { $objectToArray: '$statistics' } } },
          {
            $set: {
              statistics: {
                $map: {
                  input: '$statistics',
                  as: 'numValue',
                  in: {
                    k: '$$numValue.k',
                    v: {
                      price_drop: {
                        app_clicks: {
                          $ifNull: ['$$numValue.v.price_drop.app_clicks', 0]
                        },
                        subscribers_count: {
                          $ifNull: ['$$numValue.v.price_drop.subscribers_count', 0]
                        },
                        emails_sent_count: {
                          $ifNull: ['$$numValue.v.price_drop.emails_sent_count', 0]
                        },
                        emails_sent_sum_money: {
                          $multiply: [
                            {
                              $ifNull: ['$$numValue.v.price_drop.emails_sent_sum_money', 0]
                            },
                            Number(exRate)
                          ]
                        },
                        emails_opened_count: {
                          $ifNull: ['$$numValue.v.price_drop.emails_opened_count', 0]
                        },
                        emails_bounced_count: {
                          $ifNull: ['$$numValue.v.price_drop.emails_bounced_count', 0]
                        },
                        leads_count: {
                          $ifNull: ['$$numValue.v.price_drop.leads_count', 0]
                        },
                        leads_sum_money: {
                          $multiply: [
                            {
                              $ifNull: ['$$numValue.v.price_drop.leads_sum_money', 0]
                            },
                            Number(exRate)
                          ]
                        },
                        conversions_count: {
                          $ifNull: ['$$numValue.v.price_drop.conversions_count', 0]
                        },
                        conversions_sum_money: {
                          $multiply: [
                            {
                              $ifNull: ['$$numValue.v.price_drop.conversions_sum_money', 0]
                            },
                            Number(exRate)
                          ]
                        }
                      },
                      back_in_stock: {
                        app_clicks: {
                          $ifNull: ['$$numValue.v.back_in_stock.app_clicks', 0]
                        },
                        subscribers_count: {
                          $ifNull: ['$$numValue.v.back_in_stock.subscribers_count', 0]
                        },
                        emails_sent_count: {
                          $ifNull: ['$$numValue.v.back_in_stock.emails_sent_count', 0]
                        },
                        emails_sent_sum_money: {
                          $multiply: [
                            {
                              $ifNull: ['$$numValue.v.back_in_stock.emails_sent_sum_money', 0]
                            },
                            Number(exRate)
                          ]
                        },
                        emails_opened_count: {
                          $ifNull: ['$$numValue.v.back_in_stock.emails_opened_count', 0]
                        },
                        emails_bounced_count: {
                          $ifNull: ['$$numValue.v.back_in_stock.emails_bounced_count', 0]
                        },
                        leads_count: {
                          $ifNull: ['$$numValue.v.back_in_stock.leads_count', 0]
                        },
                        leads_sum_money: {
                          $multiply: [
                            {
                              $ifNull: ['$$numValue.v.back_in_stock.leads_sum_money', 0]
                            },
                            Number(exRate)
                          ]
                        },
                        conversions_count: {
                          $ifNull: ['$$numValue.v.back_in_stock.conversions_count', 0]
                        },
                        conversions_sum_money: {
                          $multiply: [
                            {
                              $ifNull: ['$$numValue.v.back_in_stock.conversions_sum_money', 0]
                            },
                            Number(exRate)
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          { $set: { statistics: { $arrayToObject: '$statistics' } } }
        ])

        if (response[0]?.statistics) {
          await Statistics.updateOne(
            { shopId: shop._id },
            {
              $set: {
                statistics: response[0]?.statistics
              }
            }
          )
        }
      }

      shop.shopInformation = newShopInformation
      let savedShop = await shop.save()

      if (savedShop) {
        console.log(`Succesfully saved shop information`)
      }
    }
  } catch (error) {
    console.debug(`Faced an error when updating shop info for: ${shopOrigin}, error: ${error}`)
    reportEvent(shop, 'error', {
      value: 'processShopUpdate',
      message: error.message
    })
  }
}

export const subscriptionUpdate = async (shopOrigin, body) => {
  const subscription = body.app_subscription
  if (subscription.status !== 'ACTIVE') return
  const chargeName = subscription.name

  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin }, { pricingPlan: 1 })

    if (shop.pricingPlan === chargeName) return

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
  } catch (e) {
    console.log(e)
    reportEvent(shopOrigin, 'Failed to update pricing plan')
  }
}

export const productsUpdate = async (shopOrigin, body) => {
  const shop = await Shop.findOne({ shopify_domain: shopOrigin })
  const session = await getSession(shopOrigin)
  if (!session) return

  console.log('session: ', session)

  const metafield = await fetchAppInstallationMetafield(session, {
    namespace: 'bundles',
    key: 'offers'
  })
  console.log('metafield: ', metafield)
  const offers = metafield?.value ? JSON.parse(metafield.value).offers || [] : []
  //FIXME: need to make it work just small tweaks and need first to define the offers object structure
  const updatedOffers = offers.bundles.map((offer) => {
    // Skip if products doesn't exist
    // TODO: the update is relevant only if the bundle is of type mix & match
    if (offer.type === BUNDLE_TYPES.VOLUME || !offer.products) {
      return offer
    }

    // Find the index of the product in the products array
    const productIndex = offer.products.findIndex((prod) => prod.id.toString() === product.id.toString())

    // If product wasn't found in products list, return original offer
    if (productIndex === -1) {
      return offer
    }

    // Update the product in productsData
    const newProductsData = [...offer.productsData]
    newProductsData[productIndex] = product

    return {
      ...offer,
      productsData: newProductsData
    }
  })

  const response = await createAppDataMetafield(session, {
    namespace: 'bundles',
    key: 'offers',
    type: 'json',
    value: JSON.stringify({ offers: updatedOffers })
  })
}
