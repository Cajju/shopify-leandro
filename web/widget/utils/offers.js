import {
  BUNDLE_VOLUME_QUANTITY_TYPES,
  BUNDLE_VOLUME_DISCOUNT_TYPES
} from '../../shared/utils/bundles/bundles-constants'

export const calculateRelevantOffer = ({ offers, product }) => {
  console.log('🚀 ~ calculateRelevantOffer ~ offers:', offers)
  // Check if offers is an array, if not return null
  if (!Array.isArray(offers)) {
    return null
  }
  console.log('🚀 ~ calculateRelevantOffer ~ product:', product)
  // Filter offers that include the product
  const relevantOffers = offers.filter((offer) => offer.products.includes(product.id + ''))

  // If no relevant offers, return null
  if (relevantOffers.length === 0) {
    return null
  }

  // Sort offers by their index in the original array (descending order)
  const sortedOffers = relevantOffers.sort((a, b) => offers.indexOf(b) - offers.indexOf(a))

  // Return the first (best) offer
  return sortedOffers[0]
}

export const normalizeOfferForRendering = ({ offer, product }) => {
  console.log('🚀 ~ normalizeOfferForRendering ~ offer:', offer)
  if (!offer) return null

  // Convert product price from cents to dollars
  const productPrice = (product.price / 100).toFixed(2)

  return {
    id: offer._id,
    name: offer.txtBundleName,
    tiers: offer.tiers.map((tier, index) => {
      const quantity = getQuantityFromTier(tier.quantity)
      const originalPrice = productPrice * quantity
      const discountedPrice = calculateDiscountedPrice(originalPrice, tier.discount)
      const savings = (originalPrice - discountedPrice).toFixed(2)

      return {
        id: `tier_${index}`,
        title: tier.tierText,
        quantity,
        savings,
        originalPrice,
        discountedPrice,
        ...(tier.ribbon.show && { ribbon: tier.ribbon.text })
      }
    }),
    settings: offer.settings
  }
}

function getQuantityFromTier(quantityObj) {
  switch (quantityObj.type) {
    case BUNDLE_VOLUME_QUANTITY_TYPES.FIXED_AMOUNT:
      return quantityObj.fixedAmount
    case BUNDLE_VOLUME_QUANTITY_TYPES.RANGE:
      return quantityObj.range.min
    case BUNDLE_VOLUME_QUANTITY_TYPES.MIN_AMOUNT:
      return quantityObj.minAmount
    default:
      return 1
  }
}

function calculateDiscountedPrice(originalPrice, discountObj) {
  switch (discountObj.type) {
    case BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF:
      return Math.max(0, originalPrice - discountObj.priceOff)
    case BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF:
      return originalPrice * (1 - discountObj.percentageOff / 100)
    case BUNDLE_VOLUME_DISCOUNT_TYPES.FIXED_PRICE:
      return discountObj.fixedPrice
    case BUNDLE_VOLUME_DISCOUNT_TYPES.NO_DISCOUNT:
    default:
      return originalPrice
  }
}

export function getVariantsOptions(variants, optionKeys) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return {}
  }

  // Black / Small
  const optionsWithValues = {}
  let i = 0

  for (const optionKey of optionKeys) {
    // Color / Size

    for (const variant of variants) {
      const variantTitle = variant.title
      const variantTitleParts = variantTitle.split(' / ')

      // add with no duplicates
      if (!optionsWithValues[optionKey]) {
        optionsWithValues[optionKey] = []
      }
      if (!optionsWithValues[optionKey]?.includes(variantTitleParts[i])) {
        optionsWithValues[optionKey].push(variantTitleParts[i])
      }
    }

    i++
  }
  return optionsWithValues
}
