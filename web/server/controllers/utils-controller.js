import { Shop } from '../models/index.js'
import { reportEvent } from '../utils/amplitude.js'
import { sendEmailPostmark } from '../utils/sendEmailPostmarkapp.js'
import HttpError from '../utils/http-error.js'

export async function sendFeedback(req, res, next) {
  const shopOrigin = req?.session?.shop
  try {
    if (!shopOrigin) {
      return next(new HttpError('No shop Origin', 403))
    }

    const shop = await Shop.findOne({
      shopify_domain: shopOrigin
    })
    if (!shop) {
      reportEvent(shopOrigin, 'error', { value: 'could not fetch shop details' })
      return next(new HttpError('Shop not found', 404))
    }

    const formData = req.body
    const emailObj = {
      From: 'hello@leadhive.app',
      To: 'hello@leadhive.app',
      Subject: '[Mate.Feedback] ' + formData.subject || 'no subject',
      HtmlBody: `
        <b>Name:<b> ${shop.shopInformation.shop_owner}<br />
        <b>Email:<b> ${formData.email}<br />
        <b>Stars:<b> ${formData.rank}<br />
        <b>Message:<b> ${formData.message}<br />`
    }

    await sendEmailPostmark(emailObj)

    res.status(201).send({ success: true })
  } catch (e) {
    console.log(e)
    return next(new HttpError(`Failed to process getShop: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}

export async function amplitudeTrack(req, res, next) {
  const shopOrigin = req?.session?.shop
  if (!shopOrigin) {
    return next(new HttpError('No shop Origin', 403))
  }

  const event = req.body.event
  const value = req.body.value || ''
  const args = req.body.args || {}
  if (!event) return next(new HttpError('Event arg is required', 422))

  reportEvent(shopOrigin, event, value, args)
  res.status(200).send({ success: true })
}
