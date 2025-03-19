import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'

/**
 * @type {mongoose.SchemaDefinitionProperty}
 */
const sessionSchema = new Schema(
  {
    id: String,
    shop: String,
    state: String,
    isOnline: Boolean,
    scope: String,
    accessToken: String
  },
  {
    timestamps: true,
    collection: 'shopify_sessions'
  }
)

const Session = model(MODEL_KEY.Session, sessionSchema)

export default Session
