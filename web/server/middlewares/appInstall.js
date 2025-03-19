import { Settings, Shop, ShopInstall, Statistics } from '../../shared/models/index.js'
import { reportEvent } from '../../shared/utils/report-events/index.js'
import shopify from '../../shared/utils/shopify/index.js'
import { setAppDataMetafield } from '../../shared/utils/shopify/services/metafield-service.js'
import { executeGraphQLQuery, handleGraphQLResponse } from '../../shared/utils/lib.js'
import { constants } from '../../shared/utils/report-events/constants.js'
import PostmarkEmailService from '../../shared/utils/sendEmailPostmarkapp.js'
import TelegramNotifier from '../../shared/utils/telegram-notifications.js'
import sharedConfig from '../../shared/utils/config.js'

const SHOP_QUERY = `
query {
  shop {
    id
  }
}
`

export default async function onAppInstallHandler(req, res, next) {
  const session = req.session
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

    const shopData = await executeGraphQLQuery(session, SHOP_QUERY, { errorMessage: 'Failed to query shop' })
    const shopId_shopify = shopData.shop.id // the shopId in shopify
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

    // set settings
    const settings = await new Settings({
      shopId,
      shopify_domain: shopOrigin
    }).save()

    const appBlockMetafield = {
      type: 'json',
      namespace: 'bundles',
      key: 'settings',
      value: JSON.stringify(settings)
    }
    await setAppDataMetafield(req.session, appBlockMetafield)

    await new Statistics({
      shopId
    }).save()

    let shopInstall = await ShopInstall.findOne({ shopify_domain: shopOrigin })
    if (!shopInstall) {
      await ShopInstall.create({
        shopify_domain: shopOrigin,
        shopOwnerName: shopInformation.shop_owner,
        shopOwnerEmail: shopInformation.email
      })
    }

    res.track({
      eventName: constants.event.app.APP_INSTALLED,
      shopifyPlan: shopInformation.plan_name,
      shopInformation
    })

    const appAdminDashboardHandle = 'boxhead-bundles'
    const appAdminDashboardUrl = `https://admin.shopify.com/store/${shopOrigin.replace(
      '.myshopify.com',
      ''
    )}/apps/${appAdminDashboardHandle}`

    const postmarkEmailService = new PostmarkEmailService(sharedConfig.postmark)
    await postmarkEmailService.sendEmailWithTemplate({
      To: shopInformation.email,
      TemplateAlias: 'boxhead-bundles--app-install',
      TemplateModel: {
        userName: shopInformation.shop_owner,
        dashboardUrl: appAdminDashboardUrl
      }
    })
    const telegramNotifier = new TelegramNotifier({
      env: sharedConfig.env,
      telegram: sharedConfig.telegram
    })
    await telegramNotifier.sendNotification({
      severity: 'info',
      title: 'App Install',
      shop: req.session.shop,
      event: constants.event.app.APP_INSTALLED
    })
    console.log('App install', req.session.shop)

    next()
  } catch (e) {
    console.log(e)
    console.log('App installation failed')

    res.track({
      eventName: constants.event.app.SERVER_ERROR,
      resource: constants.event.app.APP_INSTALLED
    })
  }
}
