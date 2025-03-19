import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import 'express-async-errors'
import { readFileSync } from 'fs'
import { join } from 'path'
import serveStatic from 'serve-static'
import adminControl from './server/middlewares/adminControl.js'
import {
  errorHandler,
  initializeShutdownHandler,
  logger,
  onAppInstallHandler,
  trackEndpoint
} from './server/middlewares/index.js'
import validateAppProxyRequest from './server/middlewares/validateAppProxyRequest.js'
import apiRoutes from './server/routes/index.js'
import secretlabRoutes from './server/routes/secretlab-routes.js'
import widgetProxyRoutes from './server/routes/widget-proxy-routes.js'
import HttpError from './shared/utils/http-error.js'
import initMongoDB from './shared/utils/mongo.js'
import { initEventTracking } from './shared/utils/report-events/index.js'
import shopify from './shared/utils/shopify/index.js'
import shopifyWebhooksHandlers from './shared/utils/shopify/shopify-webhooks.js'

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10)

const STATIC_PATH =
  process.env.NODE_ENV === 'production' ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`

const app = express()

initEventTracking()
await initMongoDB()

app.use(logger)
app.use(cookieParser())

// robots handler
app.get('/robots.txt', function (req, res) {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

app.use('/secretlab', secretlabRoutes)

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot())
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: shopifyWebhooksHandlers }))

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
app.use(express.json())
app.use(cors())

app.use('/api/widget-proxy', validateAppProxyRequest, widgetProxyRoutes)

// 👇 All endpoints after this point will require an active session
app.use(
  '/api/*',
  shopify.validateAuthenticatedSession(),
  (req, res, next) => {
    // saving the session for more comfortable access
    // @ts-ignore
    req.session = res.locals.shopify.session
    // @ts-ignore
    const shopOrigin = req.session?.shop
    if (!shopOrigin) {
      return next(new HttpError('No shop Origin', 403))
    }
    next()
  },
  adminControl
)

app.use(trackEndpoint)
app.use('/api/*', onAppInstallHandler)
app.use('/api/admin', apiRoutes)

app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

// Add cache middleware for assets
app.use('/assets/*', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600000')
  next()
})

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

// Replace the simple server start with a robust server management function
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`)
  })

  initializeShutdownHandler(server, startServer)

  return server
}

// Start the server initially
startServer()
