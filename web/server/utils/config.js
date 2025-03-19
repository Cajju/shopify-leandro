/* eslint-disable no-process-env */
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

export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST.replace(/\/$/, '') + '/',
  secretlabKey: process.env.SECRET_LAB_KEY,
  productDiscountExtensionName: 'product-discount-function'
}
