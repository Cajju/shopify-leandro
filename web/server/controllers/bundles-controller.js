import { z } from 'zod'
import { Bundles, Shop } from '../models/index.js'
import bundleFormSchema from '../../shared/utils/bundles/bundles-form-schema.js'
import HttpError from '../utils/http-error.js'
import { fetchProducts, fetchProductsByIds } from '../services/product-service.js'
import { createAppDataMetafield } from '../services/metafield-service.js'

export const setBundle = async (req, res, next) => {
  const shopOrigin = req?.session?.shop
  const { bundleId } = req.params
  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    const shopId = shop.id
    const { data: populatedBundle } = req.body

    let bundle = bundleFormSchema.parse(populatedBundle)
    const bundleProducts = bundle.products.map((product) => product.id.replace(/.*\//, ''))
    bundle = { ...bundle, products: bundleProducts }

    let shopBundles = await Bundles.findOne({ shopId })
    if (!shopBundles) {
      shopBundles = new Bundles({ shopId, bundles: [bundle] })
      await shopBundles.save()
    } else {
      // Find if the bundle exists in the array
      const existingBundleIndex = shopBundles.bundles.findIndex((bundle) => bundle._id.toString() === bundleId)

      let updatedBundle = null

      if (existingBundleIndex >= 0) {
        // Edit existing bundle
        shopBundles.bundles[existingBundleIndex] = {
          ...shopBundles.bundles[existingBundleIndex],
          ...bundle
        }
        updatedBundle = shopBundles.bundles[existingBundleIndex]
      } else {
        // Add new bundle
        updatedBundle = bundle
        shopBundles.bundles.push(updatedBundle)
      }

      await shopBundles.save()

      const products = await fetchProductsByIds(req.session, bundle.products)
      updatedBundle.products = products

      //update metafield
      const metafield = await createAppDataMetafield(req.session, {
        namespace: 'bundles',
        type: 'json',
        key: 'offers',
        value: JSON.stringify(shopBundles)
      })

      console.log('metafield', metafield)

      res.status(200).json({ bundles: shopBundles.bundles, bundle: updatedBundle })
    }
  } catch (e) {
    console.log(e)
    if (e instanceof z.ZodError) {
      return next(new HttpError(`Recieved data is invalid: ${e.errors}. Shop: ${shopOrigin}`, 400))
    } else {
      return next(
        new HttpError(`We had an isssue with processing your request: ${e.message}. Shop: ${shopOrigin}`, 500)
      )
    }
  }
}

export const getBundles = async (req, res, next) => {
  const shopOrigin = req?.session?.shop
  const status = req.query.status || 'all' // Default to 'all' if not specified

  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    if (!shop) {
      return next(new HttpError(`Shop not found: ${shopOrigin}`, 404))
    }
    const shopId = shop.id
    const shopBundles = await Bundles.findOne({ shopId })

    // If no bundles, return empty array
    if (!shopBundles) {
      return res.json({ bundles: [] })
    }

    // Filter bundles based on status
    let filteredBundles = shopBundles.bundles
    if (status !== 'all') {
      filteredBundles = shopBundles.bundles.filter((bundle) => bundle.status === status)
    }

    // Return filtered bundles
    res.status(200).json({ bundles: filteredBundles })
  } catch (e) {
    console.error(e)
    return next(new HttpError(`We had an issue retrieving your bundles: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}

export const getBundleById = async (req, res, next) => {
  const { bundleId } = req.params
  const shopOrigin = req?.session?.shop

  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    if (!shop) {
      return next(new HttpError(`Shop not found: ${shopOrigin}`, 404))
    }

    const shopId = shop.id
    const shopBundles = await Bundles.findOne({ shopId })
    if (!shopBundles) {
      return next(new HttpError(`No bundles found for shop: ${shopOrigin}`, 404))
    }

    const bundle = shopBundles.bundles.find((b) => b._id.toString() === bundleId)
    if (!bundle) {
      return next(new HttpError(`Bundle not found with id: ${bundleId}`, 404))
    }

    // Fetch products using the productService
    const products = await fetchProductsByIds(req.session, bundle.products)
    // Replace the product IDs with the full product data
    const bundleWithFullProducts = {
      ...bundle.toObject(),
      products: products
    }

    res.json({ bundle: bundleWithFullProducts })
  } catch (e) {
    console.error(e)
    return next(new HttpError(`We had an issue retrieving the bundle: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}

export const deleteBundle = async (req, res, next) => {
  const { bundleId } = req.params
  const shopOrigin = req?.session?.shop

  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    if (!shop) {
      return next(new HttpError(`Shop not found: ${shopOrigin}`, 404))
    }

    const shopId = shop.id
    const shopBundles = await Bundles.findOne({ shopId })
    if (!shopBundles) {
      return next(new HttpError(`No bundles found for shop: ${shopOrigin}`, 404))
    }

    const bundleIndex = shopBundles.bundles.findIndex((b) => b._id.toString() === bundleId)
    if (bundleIndex === -1) {
      return next(new HttpError(`Bundle not found with id: ${bundleId}`, 404))
    }

    shopBundles.bundles.splice(bundleIndex, 1)
    await shopBundles.save()

    res.status(200).json({ bundles: shopBundles.bundles })
  } catch (e) {
    console.error(e)
    return next(new HttpError(`We had an issue deleting the bundle: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}

export const changeBundleStatus = async (req, res, next) => {
  const { bundleId, newStatus } = req.query
  const shopOrigin = req?.session?.shop

  try {
    const shop = await Shop.findOne({ shopify_domain: shopOrigin })
    if (!shop) {
      return next(new HttpError(`Shop not found: ${shopOrigin}`, 404))
    }

    const shopId = shop.id
    const shopBundles = await Bundles.findOne({ shopId })
    if (!shopBundles) {
      return next(new HttpError(`No bundles found for shop: ${shopOrigin}`, 404))
    }

    const bundleIndex = shopBundles.bundles.findIndex((b) => b._id.toString() === bundleId)
    if (bundleIndex === -1) {
      return next(new HttpError(`Bundle not found with id: ${bundleId}`, 404))
    }

    shopBundles.bundles[bundleIndex].status = newStatus
    await shopBundles.save()

    res.status(200).json({ bundles: shopBundles.bundles, bundle: shopBundles.bundles[bundleIndex] })
  } catch (e) {
    console.error(e)
    return next(new HttpError(`We had an issue changing the bundle status: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}
