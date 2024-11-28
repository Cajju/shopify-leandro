import { DeliveryMethod } from '@shopify/shopify-api'
import { appUninstall, shopUpdate, subscriptionUpdate, productsUpdate } from '../../controllers/webhooks-controller.js'

const CALLBACK_URL = '/api/webhooks'
/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    }
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    }
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    }
  },

  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (_topic, shop, _body, webhookId) => {
      console.log('[ACK] ', _topic, ' Shop: ', shop)
      const body = JSON.parse(_body)
      await appUninstall(shop, body)
    }
  },

  SHOP_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (_topic, shop, _body, webhookId) => {
      const body = JSON.parse(_body)
      console.log('[ACK] ', _topic, ' Shop: ', shop)
      await shopUpdate(shop, body)
    }
  },

  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (_topic, shop, _body, webhookId) => {
      console.log('[ACK] ', _topic, ' Shop: ', shop)
      const body = JSON.parse(_body)
      console.log(body)
      await subscriptionUpdate(shop, body)
    }
  },

  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: CALLBACK_URL,
    callback: async (_topic, shop, _body, webhookId) => {
      console.log('[ACK] ', _topic, ' Shop: ', shop)
      const body = JSON.parse(_body)
      console.log(body)
      await productsUpdate(shop, body)
    }
  }
}
