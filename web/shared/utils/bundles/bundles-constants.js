export const BUNDLE_TYPES = {
  VOLUME: 'volume',
  MIX_AND_MATCH: 'mixAndMatch',
  BUILD_BUNDLE: 'buildBundle'
}

export const STATUS_TYPES = {
  ACTIVE: 'active',
  DRAFT: 'draft'
}

export const BUNDLE_TYPE_LABELS = {
  [BUNDLE_TYPES.VOLUME]: 'Volume Discount',
  [BUNDLE_TYPES.MIX_AND_MATCH]: 'Bundle',
  [BUNDLE_TYPES.BUILD_BUNDLE]: 'Build a Bundle'
}

export const BUNDLE_VOLUME_QUANTITY_TYPES = {
  FIXED_AMOUNT: 'fixedAmount',
  RANGE: 'range',
  MIN_AMOUNT: 'minAmount'
}

export const BUNDLE_VOLUME_DISCOUNT_TYPES = {
  PRICE_OFF: 'priceOff',
  PERCENTAGE_OFF: 'percentageOff',
  FIXED_PRICE: 'fixedPrice',
  NO_DISCOUNT: 'noDiscount'
}

export const defaultValuesTier = {
  quantity: {
    type: [BUNDLE_VOLUME_QUANTITY_TYPES.FIXED_AMOUNT],
    fixedAmount: 2,
    range: { min: 1, max: 2 },
    minAmount: 2
  },
  discount: { type: [BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF], priceOff: 20, percentageOff: 20, fixedPrice: 20 },
  tierText: 'Buy 4 and get 20% off',
  ribbon: {
    show: false,
    text: 'SALE!'
  }
}
export const defaultValues = {
  bundleType: null,
  txtBundleName: '',
  tiers: [defaultValuesTier],
  settings: {
    preSelectedTier: '0',
    isSingleVariant: false,
    showPricePerUnit: true,
    txtAddToCart: 'Add to Cart'
  }
}
