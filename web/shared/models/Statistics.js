import { model, Schema } from 'mongoose'
import { MODEL_KEY } from './constants.js'

const ObjectId = Schema.Types.ObjectId
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */
const Statistics = Schema(
  {
    id: ObjectId,
    shopId: ObjectId,
    statistics: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
)

export default model(MODEL_KEY.Statistics, Statistics)
