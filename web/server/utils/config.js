/* eslint-disable no-process-env */
import dotenv from 'dotenv'

dotenv.config()
const isProduction = process.env.NODE_ENV === 'production'

const mongoUri = isProduction ? process.env.MONGO_URI.toString() : 'mongodb://127.0.0.1:27017/'
const mongoName = process.env.IS_STAGING == 'true' ? `mate-staging-env` : `shopify-${process.env.APP_NAME_HANDLE}-app` // when on staging use cloned DB

export default {
  appNameHandle: process.env.APP_NAME_HANDLE,
  port: parseInt(process.env.PORT, 10) || 3000,
  dev: !isProduction,
  isProd: isProduction,
  shopifyApiSecretKey: process.env.SHOPIFY_API_SECRET,
  shopifyApiKey: process.env.SHOPIFY_API_KEY,
  host: process.env.HOST + '/',
  apiVersion: process.env.SHOPIFY_API_VERSION,
  debugMode: process.env.DEBUG_MODE,
  mongoUri,
  mongoName,
  mongoFullUri: mongoUri + mongoName,
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  postmarkTransactionalApiKey: process.env.POSTMARK_TRANSACTIONAL_API_KEY,
  postmarkSenderSignatureApiKey: process.env.POSTMARK_SENDER_SIGNATURE_API_KEY,
  sendgridWebhookPK: process.env.SENDGRID_WEBHOOK_PUBLIC_KEY,
  cloudflareZoneIdentifier: process.env.CLOUDFLARE_ZONE_IDENTIFIER,
  cloudflareToken: process.env.CLOUDFLARE_TOKEN,
  defaultTrialDays: 14,
  isFreePlanAvailable: process.env.IS_FREE_PLAN_AVAILABLE === 'true',
  realCharge: process.env.REAL_CHARGE === 'true',
  pricing: [
    {
      name: 'Basic',
      price: 0,
      limit: {
        maxEmails: 30
      }
    },
    {
      name: 'Startup',
      price: 9.99,
      limit: {
        maxEmails: 200
      }
    },
    {
      name: 'Pro',
      price: 19.99,
      limit: {
        maxEmails: 1000
      }
    },
    {
      name: 'Enterprise',
      price: 39.99,
      limit: {
        maxEmails: 3000
      }
    }
  ]
}
