import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */
const ShopInstall = Schema(
  {
    shopify_domain: String,
    trialStartedAt: Date,
    trialDays: Number,
    cancelledAt: Date,
    premiumForFree: { type: Boolean, default: false },
    shopOwnerName: String,
    shopOwnerEmail: String
  },
  { timestamps: true }
)

export default model(MODEL_KEY.ShopInstall, ShopInstall)
