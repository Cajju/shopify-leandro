import { BillingInterval, LATEST_API_VERSION } from '@shopify/shopify-api'
import { shopifyApp } from '@shopify/shopify-app-express'
import { MongoDBSessionStorage } from '@shopify/shopify-app-session-storage-mongodb'
import { restResources } from '@shopify/shopify-api/rest/admin/2024-10'
import sharedConfig from '../config.js'

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  'My Shopify One-Time Charge': {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: 'USD',
    interval: BillingInterval.OneTime
  }
}

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true
    },
    billing: undefined, // or replace with billingConfig above to enable example billing
    restResources
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback'
  },
  webhooks: {
    path: '/api/webhooks'
  },
  sessionStorage: new MongoDBSessionStorage(new URL(sharedConfig.mongo.uri + sharedConfig.mongo.options), sharedConfig.mongo.name)
})

export default shopify
