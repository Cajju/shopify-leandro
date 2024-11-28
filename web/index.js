// @ts-check
import { join } from 'path'
import { readFileSync } from 'fs'
import express from 'express'
import serveStatic from 'serve-static'
import 'express-async-errors'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import shopify from './server/utils/shopify/index.js'
import shopifyWebhooksHandlers from './server/utils/shopify/shopify-webhooks.js'
import apiRoutes from './server/routes/index.js'
import initMongoDB from './server/utils/mongo.js'
import { initAmplitude } from './server/utils/amplitude.js'
import { onAppInstallHandler, errorHandler, logger } from './server/middlewares/index.js'
import HttpError from './server/utils/http-error.js'
import validateAppProxyRequest from './server/middlewares/validateAppProxyRequest.js'

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10)

const STATIC_PATH =
  process.env.NODE_ENV === 'production' ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`

const app = express()

initAmplitude()
initMongoDB()

app.use(logger)
app.use(cookieParser())

// robots handler
app.get('/robots.txt', function (req, res) {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot())
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: shopifyWebhooksHandlers }))

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
app.use(express.json())
app.use(cors())

app.get('/api/widget-proxy', validateAppProxyRequest, async (req, res) => {
  try {
    // @ts-ignore
    console.log('Received query parameters:', req.session)
    const { product_id } = req.query

    console.log('Product ID:', product_id)
    // Here, implement your logic to calculate volume discounts for the given product
    // This is just a placeholder response
    const discountData = {
      message: 'Volume discount available!',
      discounts: [
        { description: 'Buy 2', amount: '10% off' },
        { description: 'Buy 3', amount: '15% off' }
      ]
    }

    res.json(discountData)
  } catch (error) {
    console.error('Error handling /api/volume-discount request:', error)
    res.status(500).send('Internal Server Error')
  }
})

// 👇 All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession(), (req, res, next) => {
  // saving the session for more comfortable access
  // @ts-ignore
  req.session = res.locals.shopify.session
  // @ts-ignore
  const shopOrigin = req.session?.shop
  if (!shopOrigin) {
    return next(new HttpError('No shop Origin', 403))
  }
  next()
})

app.use('/api/*', onAppInstallHandler)
app.use(`/api/admin`, apiRoutes)

app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(
      readFileSync(join(STATIC_PATH, 'index.html'))
        .toString()
        .replace('%VITE_SHOPIFY_API_KEY%', process.env.SHOPIFY_API_KEY || '')
    )
})

app.use(errorHandler)

app.listen(PORT)
