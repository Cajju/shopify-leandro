import { reportEvent } from '../../shared/utils/report-events/index.js'
import TelegramNotifier from '../../shared/utils/telegram-notifications.js'
import sharedConfig from '../../shared/utils/config.js'
import { constants } from '../../shared/utils/report-events/constants.js'

export default async (error, req, res, next) => {
  const telegramNotifier = new TelegramNotifier({
    env: sharedConfig.env,
    telegram: sharedConfig.telegram
  })

  try {
    if (res.headersSent) {
      return next(error)
    }

    // Convert file system errors to appropriate HTTP status codes
    let statusCode = 500
    if (error.code === 'ENOENT') {
      statusCode = 404
    } else if (typeof error.code === 'number' && error.code >= 100 && error.code < 600) {
      statusCode = error.code
    }

    const shopOrigin = req?.session?.shop || 'Server'

    // Only notify Telegram for 5xx errors
    if (statusCode >= 500) {
      await telegramNotifier.notifyServerError(error, shopOrigin)
    }

    // Report the error event before sending response
    reportEvent(shopOrigin, constants.event.app.SERVER_ERROR, {
      error: {
        status: statusCode,
        message: error.message || 'An unknown error occurred!'
      }
    })

    // Send the response only once if headers are not sent
    if (!res.headersSent) {
      return res.status(statusCode).json({
        error: {
          status: statusCode,
          message: error.message || 'An unknown error occurred!'
        }
      })
    }
  } catch (error) {
    console.log(error)
    const shopOrigin = 'Error Handler Failed'
    const telegramNotifier = new TelegramNotifier({
      env: sharedConfig.env,
      telegram: sharedConfig.telegram
    })
    await telegramNotifier.notifyServerError(error, shopOrigin)

    // Report the error before sending response
    reportEvent('Server', constants.event.app.SERVER_ERROR, {
      error: 'Internal Server Error'
    })

    // Send the response only once
    return res.status(500).json({
      error: {
        status: 500,
        message: 'Internal Server Error'
      }
    })
  }
}
