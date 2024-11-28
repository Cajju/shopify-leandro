import morgan from 'morgan'
import envVars from '../utils/config.js'

export default morgan('tiny', {
  skip: (req, res) =>
    envVars.isProd &&
    res.statusCode < 400 &&
    (req.url.includes('script') || req.url.includes('settings?') || req.url == '/api/webhooks')
})
