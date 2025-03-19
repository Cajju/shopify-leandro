function generateProductCombinations(products, productLimits, combinationLength, bundleFixedPrice) {
  const results = []

  // Convert products and variants to flat format with additional properties
  const flatElements = products
    .flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        variantId: variant.id,
        productTitle: product.title,
        variantTitle: variant.title,
        hasOnlyDefaultVariant: product.hasOnlyDefaultVariant,
        code: `${product.id}${variant.id}` // for readable output
      }))
    )
    .sort((a, b) => a.code.localeCompare(b.code))

  function backtrack(currentCombination, startIndex, remainingLimits) {
    if (currentCombination.length === combinationLength) {
      // Wrap the combination in the desired format
      results.push({
        products: [...currentCombination],
        price: bundleFixedPrice
      })
      return
    }

    for (let i = startIndex; i < flatElements.length; i++) {
      const elem = flatElements[i]
      const productType = elem.productId

      if (remainingLimits[productType] <= 0) continue

      currentCombination.push(elem)
      remainingLimits[productType]--

      backtrack(currentCombination, i, remainingLimits)

      currentCombination.pop()
      remainingLimits[productType]++
    }
  }

  backtrack([], 0, { ...productLimits })
  return results
}

// Example usage:
const products = [
  {
    id: 'A',
    title: 'Product A',
    hasOnlyDefaultVariant: false,
    variants: [
      { id: '1', title: 'Variant A1' },
      { id: '2', title: 'Variant A2' },
      { id: '3', title: 'Variant A3' }
    ]
  },
  {
    id: 'B',
    title: 'Product B',
    hasOnlyDefaultVariant: true,
    variants: [
      { id: '1', title: 'Variant B1' },
      { id: '2', title: 'Variant B2' }
    ]
  }
]

const productLimits = { A: 2, B: 1 }
const bundleFixedPrice = 99.99
const combinations = generateProductCombinations(products, productLimits, 3, bundleFixedPrice)

// Pretty print the results
combinations.forEach((combo) => {
  const formatted = combo.products.map((item) => `${item.productTitle} (${item.variantTitle})`).join(' + ')
  console.log(`Bundle: ${formatted} - Price: $${combo.price}`)
})
