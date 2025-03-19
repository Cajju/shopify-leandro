import fetchShopifyGraphQL from '@utils/fetchShopifyGraphQL'

const FETCH_PRODUCT_METAFIELDS_QUERY = `
query FetchProductMetafields($productId: ID!) {
  product(id: $productId) {
    metafield(namespace: "shopify", key: "color-pattern") {
      id
      namespace
      key
      value
    }
  }
}
`
const FETCH_METAOBJECTS_QUERY = `
query FetchMetaobjects($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Metaobject {
      fields {
        key
        value
      }
    }
  }
}
`

export const getProductColorPatternsMetafield = async (productId) => {
  const colorPatternMetafieldData = await fetchShopifyGraphQL(FETCH_PRODUCT_METAFIELDS_QUERY, {
    variables: { productId },
    errorMessage: 'We had an issue retrieving the product metafields'
  })
  const colorPatternMetafield = colorPatternMetafieldData.product.metafield
  if (!colorPatternMetafield?.value) return []

  // Parse the metafield value
  let metaobjectIds
  try {
    metaobjectIds = JSON.parse(colorPatternMetafield.value)
  } catch (error) {
    // console.error('Error parsing metafield value:', error)
    throw new Error('Invalid metafield value format')
  }

  const metaobjects = await fetchShopifyGraphQL(FETCH_METAOBJECTS_QUERY, {
    variables: { ids: metaobjectIds },
    errorMessage: 'We had an issue retrieving the metaobjects'
  })

  // Transform the response to the desired format
  const colorsDictionary = metaobjects.nodes.map((node) => {
    const fields = {}
    node.fields.forEach((field) => {
      if (field.key === 'label' || field.key === 'color') {
        fields[field.key] = field.value
      }
    })
    return fields
  })

  return colorsDictionary
}

export default getProductColorPatternsMetafield
