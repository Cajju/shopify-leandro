import { Schema, model } from 'mongoose'
import { MODEL_KEY } from './constants.js'
import {
  BUNDLE_TYPES,
  BUNDLE_VOLUME_DISCOUNT_TYPES,
  BUNDLE_VOLUME_QUANTITY_TYPES,
  STATUS_TYPES
} from '../../shared/utils/bundles/bundles-constants.js'

const ObjectId = Schema.Types.ObjectId

const Bundles = Schema({
  shopId: {
    type: ObjectId,
    required: true,
    ref: MODEL_KEY.Shop
  },
  bundles: {
    type: [
      {
        status: {
          type: String,
          required: true,
          enum: [STATUS_TYPES.ACTIVE, STATUS_TYPES.DRAFT],
          default: STATUS_TYPES.DRAFT
        },
        bundleType: {
          type: String,
          required: true,
          enum: [BUNDLE_TYPES.VOLUME, BUNDLE_TYPES.MIX_AND_MATCH, BUNDLE_TYPES.BUILD_BUNDLE],
          default: null
        },
        txtBundleName: {
          type: String,
          required: true
        },
        products: {
          type: [String],
          required: true,
          default: []
        },
        tiers: [
          {
            quantity: {
              type: {
                type: String,
                required: true,
                enum: [
                  BUNDLE_VOLUME_QUANTITY_TYPES.FIXED_AMOUNT,
                  BUNDLE_VOLUME_QUANTITY_TYPES.RANGE,
                  BUNDLE_VOLUME_QUANTITY_TYPES.MIN_AMOUNT
                ]
              },
              fixedAmount: {
                type: Number,
                required: function () {
                  return this.quantity.type === BUNDLE_VOLUME_QUANTITY_TYPES.FIXED_AMOUNT
                }
              },
              range: {
                min: {
                  type: Number,
                  required: function () {
                    return this.quantity.type === BUNDLE_VOLUME_QUANTITY_TYPES.RANGE
                  }
                },
                max: {
                  type: Number,
                  required: function () {
                    return this.quantity.type === BUNDLE_VOLUME_QUANTITY_TYPES.RANGE
                  }
                }
              },
              minAmount: {
                type: Number,
                required: function () {
                  return this.quantity.type === BUNDLE_VOLUME_QUANTITY_TYPES.MIN_AMOUNT
                }
              }
            },
            discount: {
              type: {
                type: String,
                required: true,
                enum: [
                  BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF,
                  BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF,
                  BUNDLE_VOLUME_DISCOUNT_TYPES.FIXED_PRICE,
                  BUNDLE_VOLUME_DISCOUNT_TYPES.NO_DISCOUNT
                ]
              },
              priceOff: {
                type: Number,
                required: function () {
                  return this.discount.type === BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF
                }
              },
              percentageOff: {
                type: Number,
                required: function () {
                  return this.discount.type === BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF
                }
              },
              fixedPrice: {
                type: Number,
                required: function () {
                  return this.discount.type === BUNDLE_VOLUME_DISCOUNT_TYPES.FIXED_PRICE
                }
              }
            },
            tierText: {
              type: String,
              required: true
            },
            ribbon: {
              show: {
                type: Boolean,
                required: true,
                default: false
              },
              text: {
                type: String,
                required: function () {
                  return this.ribbon.show
                }
              }
            }
          }
        ],
        settings: {
          preSelectedTier: {
            type: String,
            required: true
          },
          isSingleVariant: {
            type: Boolean,
            required: true,
            default: false
          },
          showPricePerUnit: {
            type: Boolean,
            required: true,
            default: true
          },
          txtAddToCart: {
            type: String,
            required: true,
            default: 'Add to Cart'
          }
        }
      }
    ],
    required: true,
    default: []
  }
})

export default model(MODEL_KEY.Bundles, Bundles)
