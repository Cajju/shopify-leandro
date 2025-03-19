import shopify from './index.js'
import { Session } from '../../models/index.js'

const registerWebhooksForAllStores = async () => {
  try {
    // Now we can safely use the Session model
    const sessions = await Session.find({})
    // console.log('Direct MongoDB sessions query:', sessions)

    // Get sessions through Shopify's session storage
    const shopifySessions = []
    for (const session of sessions) {
      shopifySessions.push((await shopify.config.sessionStorage.findSessionsByShop(session.shop))[0])
    }
    // console.log('Shopify sessions:', shopifySessions)

    // Continue with webhook registration if we have sessions
    if (shopifySessions && shopifySessions.length > 0) {
      for (const session of shopifySessions) {
        try {
          const client = new shopify.api.clients.Graphql({ session })

          // First, query all webhook subscriptions
          const webhooksResponse = await client.request(`
            query {
              webhookSubscriptions(first: 100) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              `)

          const webhooks = webhooksResponse.data.webhookSubscriptions.edges
          console.log(`Found ${webhooks.length} webhooks for shop: ${session.shop}`)

          // Delete each webhook
          for (const webhook of webhooks) {
            const deleteResponse = await client.request(`
                  mutation {
                    webhookSubscriptionDelete(id: "${webhook.node.id}") {
                      deletedWebhookSubscriptionId
                      userErrors {
                        field
                        message
                      }
                    }
                  }
                `)
            console.log(`Deleted webhook ${webhook.node.id} for shop: ${session.shop}`, deleteResponse.data)
          }
        } catch (error) {
          console.error(`Failed to manage webhooks for shop: ${session.shop}`, error)
        }
      }
    } else {
      console.log('No active sessions found in the database')
    }
  } catch (error) {
    console.error('Failed to initialize webhooks:', error)
  }
}

export default registerWebhooksForAllStores
