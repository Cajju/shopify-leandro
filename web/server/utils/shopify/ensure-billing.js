import shopify from './index.js'
import { Shop, ShopInstall } from '../../models/index.js'
import envVars from '../config.js'
let { apiVersion, host, pricing, dev, isProd, defaultTrialDays } = envVars

export const BillingInterval = {
  OneTime: 'ONE_TIME',
  Every30Days: 'EVERY_30_DAYS',
  Annual: 'ANNUAL'
}
export const currencyCode = {
  USD: 'USD'
}

const RECURRING_INTERVALS = [BillingInterval.Every30Days, BillingInterval.Annual]

/**
 * You may want to charge merchants for using your app. This helper provides that function by checking if the current
 * merchant has an active one-time payment or subscription named `chargeName`. If no payment is found,
 * this helper requests it and returns a confirmation URL so that the merchant can approve the purchase.
 *
 * Learn more about billing in our documentation: https://shopify.dev/apps/billing
 */
export default async function ensureBilling(
  session,
  { chargeName, amount, currencyCode, interval },
  isProdOverride = isProd
) {
  if (!Object.values(BillingInterval).includes(interval)) {
    throw `Unrecognized billing interval '${interval}'`
  }

  isProd = isProdOverride

  let hasPayment
  let confirmationUrl = null

  if (await hasActivePayment(session, { chargeName, interval })) {
    hasPayment = true
  } else {
    hasPayment = false
    confirmationUrl = await requestPayment(session, {
      chargeName,
      amount,
      currencyCode,
      interval,
      trialDays
    })
  }

  return [hasPayment, confirmationUrl]
}

export async function calculateRemainDays(shopOrigin, trialDays = defaultTrialDays) {
  const shopInstall = await ShopInstall.findOne({ shopify_domain: shopOrigin })

  if (shopInstall?.trialDays) trialDays = shopInstall.trialDays

  if (shopInstall?.trialStartedAt) {
    const ONE_DAY = 1000 * 60 * 60 * 24
    const NOW = new Date()
    const diffDays = Math.round((NOW - shopInstall.trialStartedAt) / ONE_DAY)
    if (diffDays < 0 || diffDays >= trialDays) {
      trialDays = 0
    } else {
      trialDays -= diffDays
    }
  }
  return trialDays
}

export async function hasActivePayment(session, { chargeName, interval }) {
  const client = new shopify.api.clients.Graphql({ session })

  if (isRecurring(interval)) {
    // RECURRING PURCHASE
    const currentInstallations = await client.request(RECURRING_PURCHASES_QUERY)
    const subscriptions = currentInstallations.data.currentAppInstallation.activeSubscriptions
    console.log('Active subscriptions', subscriptions)
    for (let i = 0, len = subscriptions.length; i < len; i++) {
      const currSubscription = subscriptions[i]
      if (
        currSubscription.name === chargeName
        // (!isProd || !currSubscription.test)
      ) {
        return true
      }
    }
  } else {
    // ONE TIME PURCHASE
    let purchases
    let endCursor = null
    do {
      const currentInstallations = await client.request(ONE_TIME_PURCHASES_QUERY, {
        variables: { endCursor }
      })
      purchases = currentInstallations.body.data.currentAppInstallation.oneTimePurchases

      for (let i = 0, len = purchases.edges.length; i < len; i++) {
        const node = purchases.edges[i].node
        if (node.name === chargeName && (!isProd || !node.test) && node.status === 'ACTIVE') {
          return true
        }
      }

      endCursor = purchases.pageInfo.endCursor
    } while (purchases.pageInfo.hasNextPage)
  }

  return false
}

export async function cancelSubscription(session) {
  const clientRest = new shopify.api.clients.Rest({ session })

  try {
    const allRAC = await clientRest.get({
      path: 'recurring_application_charges'
    })
    const activeRAC = allRAC.body.recurring_application_charges.filter((currCharge) => currCharge.status === 'active')

    if (activeRAC && activeRAC.length) {
      const chargeId = activeRAC[0].id
      await fetch(`https://${shopOrigin}/admin/api/${apiVersion}/recurring_application_charges/${chargeId}.json`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      })
    }

    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    if (!shop) {
      console.log('[Cancel Subscription] shop not found: ', shopOrigin)
      return {}
    }

    // Update Pricing plan
    let freePlan = 'Basic'
    if (shop.luckyFreeStartingPlan) freePlan = shop.luckyFreeStartingPlan

    await Shop.updateOne(
      { shopify_domain: shopOrigin },
      {
        chargeId: null,
        paymentConfirmationUrl: '',
        pricingPlan: freePlan
      }
    )

    console.log(`Subscription to ${shop.pricingPlan} plan cancelled successfully. Shop: ${shopOrigin}`)
  } catch (error) {
    console.log('[Cancel Subscription] error: ', error)
    return {}
  }
}

export async function requestPayment(session, { chargeName, amount, currencyCode, interval, trialDays = 0 }) {
  const client = new shopify.api.clients.Graphql({ session })
  const returnUrl = await getReturnUrl(session, chargeName)

  let data
  if (isRecurring(interval)) {
    const mutationResponse = await requestRecurringPayment(client, returnUrl, {
      chargeName,
      amount,
      currencyCode,
      interval,
      trialDays
    })
    data = mutationResponse.data.appSubscriptionCreate
  } else {
    const mutationResponse = await requestSinglePayment(client, returnUrl, {
      chargeName,
      amount,
      currencyCode
    })
    data = mutationResponse.data.appPurchaseOneTimeCreate
  }

  if (data.userErrors.length) {
    throw new ShopifyBillingError('Error while billing the store', data.userErrors)
  }

  return data.confirmationUrl
}

async function requestRecurringPayment(client, returnUrl, { chargeName, amount, currencyCode, interval, trialDays }) {
  const mutationResponse = await client.request(RECURRING_PURCHASE_MUTATION, {
    variables: {
      name: chargeName,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              interval,
              price: { amount, currencyCode }
            }
          }
        }
      ],
      returnUrl,
      test: !isProd || client.domain === 'lead-hive.myshopify.com',
      trialDays
    }
  })

  console.log('mutationResponse', mutationResponse)

  if (mutationResponse.data.appSubscriptionCreate.userErrors.length) {
    throw new ShopifyBillingError(
      'Error while billing the store',
      mutationResponse.data.appSubscriptionCreate.userErrors
    )
  }

  return mutationResponse
}

async function requestSinglePayment(client, returnUrl, { chargeName, amount, currencyCode }) {
  const mutationResponse = await client.request(ONE_TIME_PURCHASE_MUTATION, {
    variables: {
      name: chargeName,
      price: { amount, currencyCode },
      returnUrl,
      test: dev
    }
  })

  if (mutationResponse?.body.errors && mutationResponse?.body.errors.length) {
    throw new ShopifyBillingError('Error while billing the store', mutationResponse.body.errors)
  }

  return mutationResponse
}

function isRecurring(interval) {
  return RECURRING_INTERVALS.includes(interval)
}

export function ShopifyBillingError(message, errorData) {
  this.name = 'ShopifyBillingError'
  this.stack = new Error().stack

  this.message = message
  this.errorData = errorData
}
ShopifyBillingError.prototype = new Error()

export const getPlan = (planName) => {
  return pricing.find((item) => item.name === planName)
}

export async function retreiveApplicationLaunchUrl(client) {
  let response = await client.request(
    `
      query {
        currentAppInstallation {
          launchUrl
        }
      }
    `
  )

  const {
    data: {
      currentAppInstallation: { launchUrl }
    }
  } = response
  return launchUrl
}

export const getReturnUrl = async (session, planName) => {
  const shopOrigin = session.shop
  const client = new shopify.api.clients.Graphql({ session })
  const baseUrl = await retreiveApplicationLaunchUrl(client)
  console.log('baseUrl', baseUrl)
  return `${baseUrl}/notify/plans?shop=${shopOrigin}&host=${Buffer.from(`${shopOrigin}/admin`).toString(
    'base64'
  )}&charge_name=${planName}`
}

const RECURRING_PURCHASES_QUERY = `
  query appSubscription {
    currentAppInstallation {
      activeSubscriptions {
        name, test, trialDays, createdAt, id, returnUrl
      }
    }
  }
`

const ONE_TIME_PURCHASES_QUERY = `
  query appPurchases($endCursor: String) {
    currentAppInstallation {
      oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
        edges {
          node {
            name, test, status
          }
        }
        pageInfo {
          hasNextPage, endCursor
        }
      }
    }
  }
`

const RECURRING_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $lineItems: [AppSubscriptionLineItemInput!]!
    $returnUrl: URL!
    $test: Boolean
    $trialDays: Int
  ) {
    appSubscriptionCreate(
      name: $name
      lineItems: $lineItems
      returnUrl: $returnUrl
      test: $test
      trialDays: $trialDays
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`

const ONE_TIME_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $price: MoneyInput!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appPurchaseOneTimeCreate(
      name: $name
      price: $price
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`
