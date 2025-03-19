import shopify from './shopify/index.js'

/**
 * Retrieves the session for a given shop.
 * @param {string} shop - The shop domain (e.g., 'example.myshopify.com').
 * @returns {Promise<Object|null>} - The session object or null if not found.
 */
export default async function getSession(shop) {
  const sessionId = `offline_${shop}`
  try {
    const session = await shopify.config.sessionStorage.loadSession(sessionId)
    if (session) {
      return session
    } else {
      console.error(`No session found for shop: ${shop}`)
      return null
    }
  } catch (error) {
    console.error(`Error loading session for shop: ${shop}`, error)
    return null
  }
}
