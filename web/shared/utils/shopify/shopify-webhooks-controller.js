const shopifyWebhooksController = {
  appUninstalled: async (shopOrigin, body) => {
    try {
      const shop = await Shop.findOne({ shopify_domain: shopOrigin })
      if (!shop) {
        console.warn(`App already uninstalled: ${shopOrigin}`)
        return
      }
      const timeUsed = Date.now() - shop.createdAt
      reportEvent(shopOrigin, constants.event.app.APP_UNINSTALLED, { timeUsed, installDate: shop.createdAt })

      if (shop?.shopInformation?.email) {
        const postmarkEmailService = new PostmarkEmailService(config.postmark)
        await postmarkEmailService.sendEmailWithTemplate({
          To: shop?.shopInformation?.email,
          TemplateAlias: 'boxhead-bundles--app-uninstalled',
          TemplateModel: {
            userName: shop.shopInformation.shop_owner,
            reinstall_url: `https://apps.shopify.com/boxhead-bundles`
          }
        })
      }
      // await sendTelegramNotification({
      //   severity: 'info',
      //   title: 'App Uninstall',
      //   shop: shopOrigin,
      //   event: constants.event.app.APP_UNINSTALLED
      // })

      await ShopInstall.updateOne({ shopify_domain: shopOrigin }, { $set: { cancelledAt: new Date() } })

      // console.debug(`❌ deleting shop: ${shopOrigin}`)
      await Shop.deleteOne({
        shopify_domain: shopOrigin
      })
      // console.debug(`❌ deleting settings for shop: ${shopOrigin}`)

      await Settings.deleteOne({ shopify_domain: shopOrigin })

      await Statistics.deleteMany({ shopId: shop._id })
      // console.debug(`🙌 succesfuly deleted stats for ${shopOrigin}`)

      console.debug(`🙌 succesfuly uninstalled app for ${shopOrigin}}`)

      // Trim trial days
      const remainDays = await calculateRemainDays(shopOrigin)
      await ShopInstall.updateOne(
        { shopify_domain: shopOrigin },
        { $set: { cancelledAt: new Date(), trialDays: remainDays } }
      )
    } catch (error) {
      console.debug(`Faced an error when uninstalling app from: ${shopOrigin}, error: ${error}`)
      reportEvent(shopOrigin, constants.event.app.SERVER_ERROR, {
        resource: constants.event.app.APP_UNINSTALLED,
        error: error.meessage
      })
    }
  },
  shopUpdate: async (shopOrigin, body) => {
    let shop
    try {
      const newShopInformation = body

      if (shopOrigin && newShopInformation) {
        shop = await Shop.findOne({ shopify_domain: shopOrigin })
        if (!shop) {
          reportEvent(shopOrigin, constants.event.app.MS_WEBHOOKS_ERROR, {
            resource: 'shop/update',
            message: 'shop_not_found_process_update_shop'
          })
          return
        }

        // Update shopify_domain in settings
        const oldShopDomain = shop.shopInformation?.myshopify_domain
        const newShopDomain = newShopInformation.myshopify_domain
        if (oldShopDomain !== newShopDomain) {
          await Settings.updateOne({ shopify_domain: oldShopDomain }, { $set: { shopify_domain: newShopDomain } })
        }

        shop.shopInformation = newShopInformation
        let savedShop = await shop.save()

        if (savedShop) {
          console.log(`Succesfully saved shop information`)
        }
      }
    } catch (error) {
      console.debug(`Faced an error when updating shop info for: ${shopOrigin}, error: ${error}`)
      reportEvent(shopOrigin, constants.event.app.MS_WEBHOOKS_ERROR, {
        resource: 'shop/update',
        message: error.message
      })
    }
  }
}

export default shopifyWebhooksController
