import shopify from '../../shared/utils/shopify/index.js'

export default async function validateAppProxyRequest(req, res, next) {
  console.log('Received query parameters:', req.query)

  const { signature, shop, ...restQuery } = req.query

  if (!signature) {
    console.error('Missing signature parameter')
    return res.status(400).send('Missing signature parameter')
  }

  // Rename 'signature' to 'hmac' for validation
  const queryWithHmac = { ...restQuery, hmac: signature }

  try {
    const isValid = shopify.api.utils.validateHmac(queryWithHmac)
    if (isValid) {
      // Construct the session ID
      const sessionId = `offline_${shop}`

      // Fetch the session for the shop
      const session = await shopify.config.sessionStorage.loadSession(sessionId)
      if (session) {
        req.session = session
        next()
      } else {
        console.error('No session found for shop:', shop)
        res.status(401).send('No session found for shop')
      }
    } else {
      console.error('Invalid signature')
      res.status(401).send('Invalid signature')
    }
  } catch (error) {
    console.error('Error validating app proxy request:', error)
    res.status(500).send('Error validating request')
  }
}
