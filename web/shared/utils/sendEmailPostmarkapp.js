import postmark from 'postmark'
import { CreateSignatureRequest } from 'postmark/dist/client/models/index.js'

class PostmarkEmailService {
  constructor(config) {
    this.transactionalApiKey = config.transactionalApiKey
    this.senderSignatureApiKey = config.senderSignatureApiKey
    this.messageStream = config.messageStream
    this.emailSender = config.emailSender
  }

  async sendEmailWithTemplate(template) {
    try {
      const client = new postmark.ServerClient(this.transactionalApiKey)
      const response = await client.sendEmailWithTemplate({
        From: this.emailSender,
        MessageStream: this.messageStream || 'outbound',
        ...template
      })
      return response
    } catch (error) {
      console.log('[Postmark] Failed to send email: ', error)
    }
  }

  async sendEmailPostmark(emailObj) {
    try {
      const client = new postmark.ServerClient(this.transactionalApiKey)
      const response = await client.sendEmail({
        From: this.emailSender,
        MessageStream: this.messageStream || 'outbound',
        ...emailObj
      })

      if (response.ErrorCode !== 0) {
        console.log(`[Postmark] ErrorCode: ${response.ErrorCode}. To: ${response.To}. \nMessage: ${response.Message}.`)
      }

      console.log(`[Postmark] email sent successfully to recipient.`)
    } catch (error) {
      console.log('[Postmark] Failed to send email: ', error)
    }
  }

  async sendEmailBatchWithTemplates(templatedMessagesArr) {
    try {
      const client = new postmark.ServerClient(this.transactionalApiKey)
      const responseArr = await client.sendEmailBatchWithTemplates(templatedMessagesArr)
      let countErr = 0
      for (const response of responseArr) {
        if (response.ErrorCode !== 0) {
          countErr++
          console.log(
            `[Postmark] ErrorCode: ${response.ErrorCode}. To: ${response.To}. \nMessage: ${response.Message}.`
          )
        }
      }
      const emailsSentSuccesfully = responseArr.length - countErr
      console.log(
        `[Postmark] ${emailsSentSuccesfully} out of ${responseArr.length} emails sent successfully to recipients.`
      )
    } catch (error) {
      console.log('[Postmark] Failed to send emails: ', templatedMessagesArr)
    }
  }

  async sendEmailBatch(messagesArr) {
    try {
      const client = new postmark.ServerClient(this.transactionalApiKey)
      const responseArr = await client.sendEmailBatch(messagesArr)
      let countErr = 0
      for (const response of responseArr) {
        if (response.ErrorCode !== 0) {
          countErr++
          console.log(
            `[Postmark] ErrorCode: ${response.ErrorCode}. To: ${response.To}. \nMessage: ${response.Message}.`
          )
        }
      }
      const emailsSentSuccesfully = responseArr.length - countErr
      console.log(
        `[Postmark] ${emailsSentSuccesfully} out of ${responseArr.length} emails sent successfully to recipients.`
      )
    } catch (error) {
      console.log('[Postmark] Failed to send emails: ', messagesArr)
    }
  }

  async createSenderSignature(userSignatureData) {
    try {
      const client = new postmark.AccountClient(this.senderSignatureApiKey)

      let signatureObj = new CreateSignatureRequest(userSignatureData.from_name, userSignatureData.sender_email)
      signatureObj.ReplyToEmail = userSignatureData.reply_to
      signatureObj.ConfirmationPersonalNote =
        'Confirmation from Shopify app, Mate: Back in stock emails, please approve it to start sending email notifications from your email address.'

      const response = await client.createSenderSignature(signatureObj)
      return response
    } catch (error) {
      console.log(
        '[Postmark] Failed to create sender signature for email: ',
        userSignatureData.sender_email,
        '\n           Reason: ',
        error.message
      )
      return { isError: true, message: error.message }
    }
  }

  async resendEmailSenderSignature(signature_id) {
    try {
      const client = new postmark.AccountClient(this.senderSignatureApiKey)
      const response = await client.resendSenderSignatureConfirmation(signature_id)
      return response
    } catch (error) {
      console.log(
        '[Postmark] Failed to resend confirmation email signature for signature_id: ',
        signature_id,
        '\n           Reason: ',
        error.message
      )
      return { isError: true, message: error.message }
    }
  }

  async revokeSenderSignature(signature_id) {
    try {
      const client = new postmark.AccountClient(this.senderSignatureApiKey)
      const response = await client.deleteSenderSignature(signature_id)
      return response
    } catch (error) {
      console.log(
        '[Postmark] Failed to revoke sender signature for signature_id: ',
        signature_id,
        '\n           Reason: ',
        error.message
      )
      return { isError: true, message: error.message }
    }
  }

  async getSenderSignature(signature_id) {
    try {
      const client = new postmark.AccountClient(this.senderSignatureApiKey)
      const response = await client.getSenderSignature(signature_id)
      return response
    } catch (error) {
      console.log(
        '[Postmark] Failed to get sender signature for signature_id: ',
        signature_id,
        '\n           Reason: ',
        error.message
      )
      return { isError: true, message: error.message, status: error.statusCode }
    }
  }

  static validateWebhookSignature(req) {
    try {
      const token = req.headers.authorization.replace(/^Basic /i, '')
      let buff = Buffer.from(token, 'base64')
      let text = buff.toString('utf-8')

      // hard coded credentials
      const username = 'mate'
      const password = 'armful-apron-unshaken9'

      return text === username + ':' + password
    } catch (e) {
      console.log('postmarkWebhookSignauteValidity: ', e)
      return false
    }
  }
}

export default PostmarkEmailService
