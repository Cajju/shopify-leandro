import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */
const Shop = Schema(
  {
    shopify_domain: String,
    accessToken: String,
    shopInformation: Object,
    pricingPlan: {
      type: String,
      default: null
    },
    luckyFreeStartingPlan: { type: String, default: null },
    paymentConfirmationUrl: { type: String, default: '' },
    chargeId: String
  },
  { timestamps: true }
)

export default model(MODEL_KEY.Shop, Shop)
