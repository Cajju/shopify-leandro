import morgan from 'morgan'
import sharedConfig from '../../shared/utils/config.js'

export default morgan('tiny', {
  skip: (req, res) =>
    sharedConfig.env !== 'dev' &&
    res.statusCode < 400 &&
    (req.url.includes('script') || req.url.includes('settings?') || req.url == '/api/webhooks')
})
