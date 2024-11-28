import mongoose from 'mongoose'
import envVars from '../utils/config.js'

export default async function initMongoDB() {
  mongoose.set('strictQuery', true)

  mongoose.connect(envVars.mongoFullUri, { useNewUrlParser: true, retryWrites: true, writeConcern: 'majority' })
  const db = mongoose.connection

  db.on('error', (err) => {
    console.error(`[MongoDB] Database Error → ${err}`)
  })
  db.once('open', () => {
    console.log(`[MongoDB] Connected. DB: ${envVars.mongoName}, ${envVars.dev ? '(Local)' : '(Mongo Atlas)'}`)
  })
}
