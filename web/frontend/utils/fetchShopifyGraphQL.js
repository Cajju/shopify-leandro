/**
 * Executes a GraphQL query against the Shopify Admin API
 * @param {string} query - The GraphQL query string to execute
 * @param {Object} variables - Variables to pass to the GraphQL query
 * @returns {Promise<Object>} The data property from the GraphQL response
 */
const fetchShopifyGraphQL = async (
  query,
  { variables = {}, errorMessage = 'Failed to execute GraphQL query' } = {}
) => {
  try {
    const response = await fetch('shopify:admin/api/graphql.json', {
      method: 'POST',
      body: JSON.stringify({ query, variables })
    })
    const data = await response.json()

    if (!data) {
      throw new Error(`${errorMessage}: No data returned`)
    }

    const operation = Object.keys(data)[0]
    const errors = data[operation]?.userErrors

    if (errors && errors.length > 0) {
      const errorDetails = errors.map((error) => ({
        message: error.message,
        code: error.code
      }))

      throw new Error(`${errorMessage}: ${JSON.stringify(errorDetails)}`)
    }

    if (data?.errors) {
      console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2))
      throw new Error(`${errorMessage}: ${data.errors[0].message}`)
    }

    return data.data
  } catch (error) {
    throw new Error(`GraphQL Error: ${error.message}. Variables: ${JSON.stringify(variables)}`)
  }
}

export default fetchShopifyGraphQL
