import { DeliveryMethod } from '@shopify/shopify-api'
import shopifyWebhooksController from './shopify-webhooks-controller.js'

const CALLBACK_URL = '/api/webhooks'

const defaultWebhookConfig = {
  deliveryMethod: DeliveryMethod.Http,
  callbackUrl: CALLBACK_URL
}

const createWebhookHandler = (handler) => {
  return async (_topic, shop, _body, webhookId) => {
    console.log('[ACK] ', _topic, ' Shop: ', shop)
    const body = JSON.parse(_body)

    if (handler) {
      await handler(shop, body)
    } else {
      console.warn(`[WARN] No handler implemented for webhook ${_topic}`)
    }
  }
}

const webhookHandlers = [
  {
    topic: 'CUSTOMERS_DATA_REQUEST',
    handler: async (shop, body) => {
      // No-op handler
      // Payload shape documented in comments:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [299938, 280263, 220458],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": { "id": 9999 }
      // }
    }
  },
  {
    topic: 'CUSTOMERS_REDACT',
    handler: async (shop, body) => {
      // No-op handler
      // Payload shape documented in comments:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [299938, 280263, 220458]
      // }
    }
  },
  {
    topic: 'SHOP_REDACT',
    handler: async (shop, body) => {
      // No-op handler
      // Payload shape documented in comments:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    }
  },
  {
    topic: 'APP_UNINSTALLED',
    handler: shopifyWebhooksController.appUninstalled
  },
  {
    topic: 'SHOP_UPDATE',
    handler: shopifyWebhooksController.shopUpdate
  }
]

const generateWebhooks = () => {
  const webhooks = {}

  // Add all handlers from the list
  webhookHandlers.forEach(({ topic, handler }) => {
    webhooks[topic] = {
      ...defaultWebhookConfig,
      callback: createWebhookHandler(handler)
    }
  })

  return webhooks
}

export default generateWebhooks()
