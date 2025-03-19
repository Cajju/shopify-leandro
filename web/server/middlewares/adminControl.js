import HttpError from '../../shared/utils/http-error.js'
import shopify from '../../shared/utils/shopify/index.js'

const ADMIN_SHOP_DOMAINS = ['leadhive-prd.myshopify.com', 'leadhive-stg.myshopify.com', 'leadhive-dev.myshopify.com']

const adminControl = async (req, res, next) => {
  const shopOriginToControl = req.headers['admin-control-shop']
  const isUserRoleIsAdmin = ADMIN_SHOP_DOMAINS.includes(req.session.shop)

  if (!shopOriginToControl || !isUserRoleIsAdmin) {
    return next()
  }
  const sessions = await shopify.config.sessionStorage.findSessionsByShop(shopOriginToControl)
  const session = sessions[0]

  // Manipulate session if the shop is one of ADMIN_SHOP_DOMAINS
  if (session) {
    req.session = session
    req.isSessionManipulated = true
    console.log(`Session manipulated for ${req.session.shop} to control shop: ${shopOriginToControl}`)
  } else {
    return next(new HttpError('Shop not found', 404))
  }

  next()
}

export default adminControl
