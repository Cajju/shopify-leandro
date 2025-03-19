import fetchShopifyGraphQL from '@utils/fetchShopifyGraphQL'

export const GET_PRODUCTS_BY_IDS_QUERY = `
query($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      featuredImage {
        url
      }
      variantsCount {
        count
      }
      options {
        name,
        values
      }
      hasOnlyDefaultVariant
      onlineStorePreviewUrl
      variants(first: 100) {
        edges {
          node {
            id
            title
            price
            availableForSale
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
const getProductsByIds = async (ids) => {
  const productsData = await fetchShopifyGraphQL(GET_PRODUCTS_BY_IDS_QUERY, {
    variables: { ids },
    errorMessage: 'We had an issue retrieving the products'
  })
  const products = productsData.nodes
  return products
}

export default getProductsByIds
