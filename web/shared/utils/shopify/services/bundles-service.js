import { getCartTransformId, registerCartTransform } from './cart-transform-service.js'
import { deleteMetafield, setAppDataMetafield } from './metafield-service.js'

// you have to run setBundlesMetafields after this function cause it will delete also important metafields data
export const cleanBundleMetafields = async (session, bundleRecord) => {
  if (bundleRecord.bundleType === BUNDLE_TYPES.FIXED_BUNDLES) {
    for (const product of bundleRecord.products) {
      //clean metafields for related products

      try {
        await deleteMetafield(session, {
          namespace: '$app:fixed-bundles',
          key: 'related-products-offers',
          ownerId: product.id
        })
      } catch (e) {
        console.log('related-products-offers metafield not deleted', e)
        // not error cause it might not exist
      }
    }
  }
}

export const setBundlesMetafields = async (session, shopBundles) => {
  const compressBundleData = (bundle) => {
    return {
      id: bundle._id,
      title: bundle.title,
      status: bundle.status,
      bundleType: bundle.bundleType,
      ...(bundle.bundleType === BUNDLE_TYPES.VOLUME && {
        products: bundle.products,
        tiers: bundle.tiers,
        settings: bundle.settings
      }),
      ...(bundle.bundleType === BUNDLE_TYPES.FIXED_BUNDLES && {
        fixedBundles: {
          parentBundleProduct: {
            productId: bundle.fixedBundles.parentBundleProduct.productId.replace('gid://shopify/Product/', ''),
            variantId: bundle.fixedBundles.parentBundleProduct.variantId.replace('gid://shopify/ProductVariant/', '')
          },
          productsVariants: bundle.fixedBundles.productsVariants.map((product) => ({
            id: product.id.replace('gid://shopify/Product/', ''),
            variants: product.variants.map((variant) => variant.id.replace('gid://shopify/ProductVariant/', '')),
            quantity: product.quantity
          })),
          discount: bundle.fixedBundles.discount
        }
      })
    }
  }

  // set app block metafield
  await setAppDataMetafield(session, {
    type: 'json',
    namespace: 'bundles',
    key: 'offers',
    value: JSON.stringify(shopBundles)
  })

  // set cart transform metafield
  let cartTransformId
  try {
    cartTransformId = await getCartTransformId(session)
  } catch (e) {
    cartTransformId = await registerCartTransform(session)
  }
  if (cartTransformId) {
    let relatedProductOffersMap = {},
      productRelevantOffersMap = {}
    if (!shopBundles || !shopBundles.bundles) return

    for (const bundle of shopBundles.bundles) {
      if (bundle.bundleType === BUNDLE_TYPES.VOLUME) {
        for (const product of bundle.products) {
          const productId = product.id.replace('gid://shopify/Product/', '')
          if (!productRelevantOffersMap[productId]) productRelevantOffersMap[productId] = []

          const compressedOfferData = compressBundleData(bundle)
          if (bundle.status === STATUS_TYPES.ACTIVE) {
            productRelevantOffersMap[productId].push(compressedOfferData)
          }
        }
      } else if (bundle.bundleType === BUNDLE_TYPES.FIXED_BUNDLES) {
        for (const product of bundle.products) {
          const productId = product.id.replace('gid://shopify/Product/', '')
          if (!relatedProductOffersMap[productId]) relatedProductOffersMap[productId] = []

          const compressedOfferData = compressBundleData(bundle)
          relatedProductOffersMap[productId].push(compressedOfferData)
        }

        // Set Product metafield: for discount function
        const bundleProductId = bundle.fixedBundles.parentBundleProduct.productId.replace('gid://shopify/Product/', '')
        if (!productRelevantOffersMap[bundleProductId]) productRelevantOffersMap[bundleProductId] = []
        const compressedOfferData = compressBundleData(bundle)
        if (bundle.status === STATUS_TYPES.ACTIVE) {
          productRelevantOffersMap[bundleProductId].push(compressedOfferData)
        }

        // Set Product metafield: for widget at bundle page and at related products pages
        const relatedProductsIds = [
          ...bundle.products.map((product) => product.id),
          bundle.fixedBundles.parentBundleProduct.productId
        ]
        for (const productId of relatedProductsIds) {
          await setAppDataMetafield(session, {
            namespace: '$app:custom',
            key: 'bundle_products',
            type: 'list.product_reference',
            ownerId: productId,
            value: JSON.stringify(relatedProductsIds)
          })
        }
      }
    }

    // Set Product metafield for each product with its offers (for cart transformer function)
    for (const [productId, offers] of Object.entries(relatedProductOffersMap)) {
      await setAppDataMetafield(session, {
        namespace: '$app:fixed-bundles',
        key: 'related-products-offers',
        type: 'json',
        ownerId: `gid://shopify/Product/${productId}`,
        value: JSON.stringify(offers)
      })
    }

    // Set Product metafield: for product discount function
    for (const [productId, offers] of Object.entries(productRelevantOffersMap)) {
      await setAppDataMetafield(session, {
        namespace: '$app:bundles',
        key: 'product-relevant-offers',
        type: 'json',
        ownerId: `gid://shopify/Product/${productId}`,
        value: JSON.stringify(offers)
      })
    }
  }
}
