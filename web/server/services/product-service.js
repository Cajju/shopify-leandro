import shopify from '../utils/shopify/index.js'
import HttpError from '../utils/http-error.js'

const GET_SHOP_PRODUCTS_QUERY = `
query($query: String!, $first: Int!, $after: String) {
  products(first: $first, after: $after, query: $query) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        featuredImage {
          url
        }
        variantsCount {
          count
        }
        options {
          id
        }
        variants(first: 1) {
          edges {
            node {
              price
            }
          }
        }
      }
    }
  }
}
`

const getTotalProductCount = async (client) => {
  try {
    const countResponse = await client.request(`
      {
        productsCount {
          count
        }
      }
    `)
    return countResponse.data.productsCount.count
  } catch (e) {
    console.error('Error fetching product count:', e)
    return 0
  }
}

const GET_PRODUCTS_BY_IDS_QUERY = `
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
        id
      }
      variants(first: 1) {
        edges {
          node {
            price
          }
        }
      }
    }
  }
}
`

export const fetchProducts = async (session, options = {}) => {
  const { page = 1, limit = 10, search = '' } = options
  const client = new shopify.api.clients.Graphql({ session })

  try {
    const response = await client.request(GET_SHOP_PRODUCTS_QUERY, {
      variables: {
        query: search ? `title:*${search}*` : '',
        first: parseInt(limit),
        after: page > 1 ? Buffer.from(`${(page - 1) * limit}`).toString('base64') : null
      }
    })

    if (response.body?.errors) {
      console.error('GraphQL Errors:', JSON.stringify(response.body.errors, null, 2))
      throw new HttpError(`GraphQL query failed: ${response.body.errors[0].message}`, 400)
    }

    const { pageInfo } = response.data.products

    const products = response.data.products.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      image: edge.node.featuredImage?.url,
      variantsCount: edge.node.variantsCount.count,
      optionsCount: edge.node.options.length,
      price: edge.node.variants.edges[0]?.node.price || null
    }))

    const totalCount = await getTotalProductCount(client)

    return {
      products,
      totalCount,
      ...pageInfo
    }
  } catch (e) {
    console.error('Caught error:', e)
    if (e.response && e.response.errors) {
      console.error('GraphQL Errors:', JSON.stringify(e.response.errors, null, 2))
    }
    throw new HttpError(`We had an issue retrieving the products: ${e.message}. Shop: ${session?.shop}`, 500)
  }
}

export const fetchProductsByIds = async (session, productIds) => {
  const client = new shopify.api.clients.Graphql({ session })

  try {
    const formattedProductIds = productIds.map((id) => `gid://shopify/Product/${id}`)

    const response = await client.request(GET_PRODUCTS_BY_IDS_QUERY, {
      variables: {
        ids: formattedProductIds
      }
    })

    if (response.body?.errors) {
      console.error('GraphQL Errors:', JSON.stringify(response.body.errors, null, 2))
      throw new HttpError(`GraphQL query failed: ${response.body.errors[0].message}`, 400)
    }

    const products = response.data.nodes
      .filter((node) => node !== null)
      .map((node) => ({
        id: node.id,
        title: node.title,
        image: node.featuredImage?.url,
        variantsCount: node.variantsCount.count,
        optionsCount: node.options.length,
        price: parseFloat(node.variants.edges[0]?.node.price) || null
      }))

    return products
  } catch (e) {
    console.error('Caught error:', e)
    if (e.response && e.response.errors) {
      console.error('GraphQL Errors:', JSON.stringify(e.response.errors, null, 2))
    }
    throw new HttpError(`We had an issue retrieving the products: ${e.message}. Shop: ${session?.shop}`, 500)
  }
}
