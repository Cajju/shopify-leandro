import { Shop } from '../../shared/models/index.js'
import sharedConfig from '../../shared/utils/config.js'
import HttpError from '../../shared/utils/http-error.js'
import { constants } from '../../shared/utils/report-events/constants.js'
import { reportEvent } from '../../shared/utils/report-events/index.js'
import PostmarkEmailService from '../../shared/utils/sendEmailPostmarkapp.js'

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
      reportEvent(shopOrigin, constants.event.app.SERVER_ERROR, { message: 'could not fetch shop details' })
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

    const postmarkEmailService = new PostmarkEmailService(sharedConfig.postmark)
    await postmarkEmailService.sendEmailPostmark(emailObj)

    res.status(201).send({ success: true })
  } catch (e) {
    console.log(e)
    return next(new HttpError(`Failed to process getShop: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}
