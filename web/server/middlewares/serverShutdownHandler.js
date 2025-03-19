import TelegramNotifier from '../../shared/utils/telegram-notifications.js'
import sharedConfig from '../../shared/utils/config.js'

export default function initializeShutdownHandler(server, startServer) {
  let isManualShutdown = false

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error)
    await handleErrorShutdown('Uncaught Exception', error)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    await handleErrorShutdown(
      'Unhandled Promise Rejection',
      reason instanceof Error ? reason : new Error(String(reason))
    )
  })

  // Handle server-side errors
  server.on('error', async (error) => {
    console.error('Server error:', error)
    await handleErrorShutdown('Server Error', error)

    // Give time for the notification to be sent
    setTimeout(() => {
      server.close(() => {
        process.exit(1)
      })
    }, 1000)
  })

  // SIGTERM handler
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Performing graceful shutdown...')

    if (!isManualShutdown) {
      await handleErrorShutdown('Server crashed or was forcefully terminated')
    }

    server.close(() => {
      console.log('Server closed. Exiting process.')
      process.exit(isManualShutdown ? 0 : 1)
    })
  })

  // Helper function for error-triggered shutdowns
  async function handleErrorShutdown(title, error) {
    try {
      const message = error ? `${title}: ${error.message}` : title

      const telegramNotifier = new TelegramNotifier({
        env: sharedConfig.env,
        telegram: sharedConfig.telegram
      })
      await telegramNotifier.notifyServerDown(message)
      console.log('Server down notification sent successfully')
    } catch (notifyError) {
      console.error('Failed to send server down notification:', notifyError)
    }
  }

  return {
    markAsManualShutdown: () => {
      isManualShutdown = true
    },
    isManualShutdown: () => isManualShutdown
  }
}
