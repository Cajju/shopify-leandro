import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'

const ObjectId = Schema.Types.ObjectId
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */
const Settings = Schema(
  {
    shopId: ObjectId,
    shopify_domain: String,
    status: {
      onboardingBanner: {
        hideBanner: {
          type: Boolean,
          default: false
        },
        isAppWidgetTested: {
          type: Boolean,
          default: false
        }
      }
    },
    crisp: {
      events: {
        on_fresh_start_event: {
          type: Boolean,
          default: false
        },
        on_app_install_finish: {
          type: Boolean,
          default: false
        }
      }
    },
    global: {
      total: {
        type: String,
        default: 'Total'
      },
      outOfStock: {
        type: String,
        default: 'Out of stock'
      },
      viewDetails: {
        type: String,
        default: 'View details'
      }
    },
    volumeDiscount: {
      saveBanner: {
        type: String,
        default: 'SAVE {discount_amount}'
      },
      pricePerUnit: {
        type: String,
        default: 'each'
      }
    },
    discounts: {
      combinesWithAll: {
        type: Boolean,
        default: true
      }
    },
    advanced: {
      vintageThemeCompatibility: {
        isUsingVintageTheme: {
          type: Boolean,
          default: false
        },
        priceSelectors: {
          type: [String],
          default: []
        },
        variantSelectors: {
          type: [String],
          default: []
        },
        quantitySelectors: {
          type: [String],
          default: []
        },
        addToCartSelectors: {
          type: [String],
          default: []
        }
      }
    }
  },
  {
    timestamps: true
  }
)

export default model(MODEL_KEY.Settings, Settings)
