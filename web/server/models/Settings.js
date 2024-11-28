import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'

const ObjectId = Schema.Types.ObjectId

const Settings = Schema(
  {
    shopId: ObjectId,
    shopify_domain: String,
    status: {},
    general: {}
  },
  {
    timestamps: true
  }
)

export default model(MODEL_KEY.Settings, Settings)
