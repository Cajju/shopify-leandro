import mongoose from 'mongoose'
import sharedConfig from '../utils/config.js'

export default async function initMongoDB() {
  mongoose.set('strictQuery', true)

  try {
    if (!sharedConfig.mongo.name) {
      throw new Error('MongoDB name is not set')
    }
    const mongoFullUri = `${sharedConfig.mongo.uri}/${sharedConfig.mongo.name}${sharedConfig.mongo.options}`

    mongoose.connect(mongoFullUri, { retryWrites: false, writeConcern: 'majority' })

    const db = mongoose.connection
    db.on('error', (err) => {
      console.error(`[MongoDB] Database Error → ${err}`)
    })
    db.once('open', () => {
      console.log(
        `[MongoDB] Connected. DB: ${sharedConfig.mongo.name}, ${
          sharedConfig.env !== 'dev' ? '(Mongo cloud)' : '(Local)'
        }, state: ${mongoose.connection.readyState === 1 ? '✅' : '❌'}`
      )
    })
  } catch (error) {
    console.error('[MongoDB] Connection Error:', error)
    throw error
  }
}
