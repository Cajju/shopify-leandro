import shopifyConfig from './shopify/config.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment files
if (process.env.NODE_ENV !== 'production') {
  // Load .env from parent directory first (if it exists)
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
}
// Load default .env file (will not override existing env vars)
dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'
const appAdminDashboardHandle = 'boxhead-bundles'
const appNameLabel = 'Boxhead Bundles'

const config = {
  ...shopifyConfig,
  appNameHandle: 'bundles',
  appAdminDashboardHandle,
  appNameLabel,
  appAdminDashboardUrl: (shopOrigin) =>
    `https://admin.shopify.com/store/${shopOrigin.replace('.myshopify.com', '')}/apps/${appAdminDashboardHandle}`,
  env: process.env.ENV || 'dev',
  mongo: {
    uri: isProduction ? process.env.MONGO_URI.toString().replace(/\/$/, '') : 'mongodb://127.0.0.1:27017',
    name: process.env.MONGO_NAME,
    options: isProduction ? process.env.MONGO_OPTIONS : ''
  },
  postmark: {
    emailSender: 'support@zynclabs.com',
    messageStream: 'transactional-boxhead-bundles',
    transactionalApiKey: process.env.POSTMARK_TRANSACTIONAL_API_KEY,
    senderSignatureApiKey: process.env.POSTMARK_SENDER_SIGNATURE_API_KEY
  },
  telegram: {
    appName: appNameLabel,
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  posthog: {
    apiKey: process.env.VITE_POSTHOG_API_KEY
  },
  shopifyBundlesDiscountsExtensionId: process.env.SHOPIFY_BUNDLES_DISCOUNTS_EXTENSION_ID
}

export default config
