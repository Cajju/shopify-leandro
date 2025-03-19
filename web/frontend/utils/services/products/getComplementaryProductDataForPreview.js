import fetchShopifyGraphQL from '@utils/fetchShopifyGraphQL'

const GET_PRODUCT_BY_ID_QUERY = `
query($id: ID!) {
  node(id: $id) {
    ... on Product {
      id
      onlineStorePreviewUrl
      featuredImage {
        url
      }
      variantsCount {
        count
      }
      options {
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price
            availableForSale
            inventoryPolicy
            inventoryQuantity
            inventoryItem {
              inventoryHistoryUrl
            }
            selectedOptions{
              name
              value
            }
          }
        }
      }
    }
  }
}
`
const getComplementaryProductDataForPreview = async (productId) => {
  const complementaryProductDataForPreview = await fetchShopifyGraphQL(GET_PRODUCT_BY_ID_QUERY, {
    variables: { id: productId },
    errorMessage: 'We had an issue retrieving the product'
  })

  if (!complementaryProductDataForPreview.node) {
    return null
  }
  return {
    onlineStorePreviewUrl: complementaryProductDataForPreview.node.onlineStorePreviewUrl,
    featuredImage: complementaryProductDataForPreview.node.featuredImage?.url,
    variantsCount: complementaryProductDataForPreview.node.variantsCount.count,
    optionsCount: complementaryProductDataForPreview.node.options.length,
    price: complementaryProductDataForPreview.node.variants.edges[0]?.node.price || null,
    variants: complementaryProductDataForPreview.node.variants.edges.map((variant) => ({
      ...variant.node
    }))
  }
}

export default getComplementaryProductDataForPreview
