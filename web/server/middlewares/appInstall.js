import envVars from '../utils/config.js'
import { Settings, Shop, ShopInstall, Statistics } from '../models/index.js'
import { reportEvent } from '../utils/amplitude.js'
import shopify from '../utils/shopify/index.js'

export default async function onAppInstallHandler(req, res, next) {
  const session = res.locals.shopify.session
  const shopOrigin = session.shop
  const accessToken = session.accessToken
  try {
    //   this query is checking if shop exist,
    //   if not exist: returned null and insert a temporary shop name so other requsets won't think this shop is not existed ,
    //   otherwise it exists and insert a temporary shop
    let shop = await Shop.findOneAndUpdate(
      { shopify_domain: shopOrigin },
      { shopify_domain: shopOrigin },
      { upsert: true }
    )
    if (shop) return next()

    const shopInformation = (await shopify.api.rest.Shop.all({ session })).data[0]

    const shopId = (await Shop.findOne({ shopify_domain: shopOrigin }, { _id: 1 }))?._id

    shop = new Shop({
      _id: shopId,
      shopify_domain: shopOrigin,
      accessToken,
      isActive: false,
      shopInformation,
      pricingPlan: 'Basic'
    })
    shop.isNew = false
    shop.save()

    await new Settings({
      shopId: shopId,
      shopify_domain: shopOrigin
    }).save()

    await new Statistics({
      shopId: shopId
    }).save()

    let shopInstall = await ShopInstall.findOne({ shopify_domain: shopOrigin })
    if (!shopInstall) {
      await ShopInstall.create({ shopify_domain: shopOrigin })
    }

    reportEvent(shopOrigin, 'install', shopInformation.plan_name, {
      userProps: { ...shopInformation }
    })

    next()
  } catch (e) {
    console.log(e)
    console.log('App installation failed')
    reportEvent(shopOrigin, 'App installation failed')
  }
}
