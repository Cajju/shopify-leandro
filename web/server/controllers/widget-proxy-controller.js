import { fetchProductsByIds } from '../../shared/utils/shopify/services/product-service.js'
import shopify from '../../shared/utils/shopify/index.js'

export const getProduct = async (req, res) => {
  try {
    const { product_id } = req.query
    let product = (await fetchProductsByIds(req.session, [product_id]))?.[0] || null

    // Transform single product data
    const normalizeProduct = (node) => {
      if (!node) return null
      const productId = Number(node.id.replace('gid://shopify/Product/', ''))

      // Transform options from objects to simple array of values
      const options = node.options.map((option) => option.name)
      // Normalize variants
      const variants = node.variants.map((variant, index) => {
        const selectedOptions = variant.selectedOptions.reduce((acc, opt) => {
          const optionNumber = index + 1
          acc[`option${optionNumber}`] = opt.value
          return acc
        }, {})

        return {
          id: Number(variant.id.replace('gid://shopify/ProductVariant/', '')),
          product_id: productId,
          title: variant.title,
          price: Math.round(parseFloat(variant.price) * 100), // Convert price from decimal to cents,
          sku: null,
          position: index + 1,
          compare_at_price: '',
          fulfillment_service: 'manual',
          inventory_management: 'shopify',
          ...selectedOptions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          taxable: true,
          barcode: null,
          grams: 0,
          image_id: null,
          weight: 0,
          weight_unit: 'lb',
          requires_shipping: true,
          quantity_rule: {
            min: 1,
            max: null,
            increment: 1
          },
          price_currency: 'ILS',
          compare_at_price_currency: '',
          quantity_price_breaks: [],
          available: variant.availableForSale,
          options
        }
      })

      return {
        id: productId,
        title: node.title,
        variants,
        options,
        available: node.variants.some((variant) => variant.availableForSale)
      }
    }

    res.json({ product: normalizeProduct(product) })
  } catch (e) {
    console.error(e)
    return next(new HttpError(`We had an issue retrieving the bundle: ${e.message}. Shop: ${shopOrigin}`, 500))
  }
}
