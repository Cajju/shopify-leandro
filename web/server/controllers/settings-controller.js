import { flatten } from 'mongo-dot-notation'
import { Settings } from '../../shared/models/index.js'
import HttpError from '../../shared/utils/http-error.js'

export const getSettings = async (req, res, next) => {
  const shopOrigin = req.session.shop
  const maxRetries = 3
  let attempts = 0
  let settings

  while (attempts < maxRetries) {
    try {
      settings = await Settings.findOne({ shopify_domain: shopOrigin })
      if (settings) {
        res.status(200).json({ settings })
        return
      } else {
        // Do not return an error immediately; continue to retry
        if (attempts >= maxRetries) {
          return next(new HttpError(`Settings not found after ${maxRetries} attempts.`, 404))
        }
      }
    } catch (e) {
      attempts++
      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for 2 seconds
      } else {
        return next(new HttpError(`Failed to process getSettings: ${e.message}. Shop: ${shopOrigin}`, 500))
      }
    }
  }
}

export const setSettings = async (req, res, next) => {
  const shopOrigin = req.session.shop
  try {
    const isPatch = req.query?.patch === 'true'
    let { settings } = req.body

    //delete temporary data
    delete settings.shopId
    delete settings.shopify_domain

    if (isPatch) {
      settings = flatten(settings)['$set']
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      { shopify_domain: shopOrigin },
      { $set: { ...settings } },
      { new: true }
    )

    res.status(200).json({ settings: updatedSettings })
  } catch (e) {
    return next(new HttpError(`Failed to process setSettings: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}
