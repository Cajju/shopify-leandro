import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'

const ShopInstall = Schema(
  {
    shopify_domain: String,
    trialStartedAt: Date,
    trialDays: Number,
    cancelledAt: Date,
    premiumForFree: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model(MODEL_KEY.ShopInstall, ShopInstall)
