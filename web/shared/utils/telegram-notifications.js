import { Telegraf } from 'telegraf'

class TelegramNotifier {
  constructor(config) {
    const { env, telegram } = config
    this.env = env
    this.appName = telegram.appName
    this.chatId = telegram.chatId
    this.botToken = telegram.botToken

    // Initialize bot if credentials are provided
    if (telegram.botToken) {
      this.bot = new Telegraf(telegram.botToken)
    }
  }

  static SEVERITY_EMOJIS = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
    error: '❌'
  }

  async sendNotification({ severity = 'info', title, message, event, shop, error = null }) {
    if (this.env !== 'prd') {
      // console.log('Telegram notification not sent in dev mode')
      return
    }

    if (!this.bot || !this.chatId) {
      console.log('Telegram credentials not configured')
      return
    }

    const emoji = TelegramNotifier.SEVERITY_EMOJIS[severity] || TelegramNotifier.SEVERITY_EMOJIS.info

    const formattedMessage = `
${emoji} <b>${title}</b>
<b>App:</b> ${this.appName}
<b>Shop:</b> ${shop}${event ? `\n<b>Event:</b> ${event}` : ''}${message ? `\n<b>Details:</b> ${message}` : ''}${
      error ? `\n<b>Error:</b> ${error.message}\n<b>Stack:</b> ${error.stack?.slice(0, 300)}...` : ''
    }

<b>Environment:</b> ${this.env}
<b>Time:</b> ${this._getFormattedDateTime()}\n
`

    try {
      await this.bot.telegram.sendMessage(this.chatId, formattedMessage, {
        parse_mode: 'HTML'
      })
    } catch (error) {
      console.error('Error sending telegram notification:', error)
    }
  }

  async notifyServerError(error, shopOrigin = 'Unknown Shop') {
    await this.sendNotification({
      severity: 'error',
      title: 'Server Error',
      shop: shopOrigin,
      error: error
    })
  }

  async notifyServerDown() {
    await this.sendNotification({
      severity: 'critical',
      title: 'Server Down',
      shop: 'Server',
      message: 'Server is not responding'
    })
  }

  _getFormattedDateTime() {
    const date = new Date()
    const timeString = date.toLocaleTimeString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const dateString = date.toLocaleDateString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
    return `${timeString} - ${dateString}`
  }
}

export default TelegramNotifier
