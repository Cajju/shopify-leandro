import HttpError from './http-error.js'
import shopify from './shopify/index.js'

function omitKeys(object, keysToOmit) {
  const keysSet = new Set(keysToOmit)
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keysSet.has(key)))
}

export async function handleGraphQLResponse(response, errorMessage) {
  const data = response.data

  if (!data) {
    throw new HttpError(`${errorMessage}: No data returned`, 500)
  }

  const operation = Object.keys(data)[0]
  const errors = data[operation]?.userErrors

  if (errors && errors.length > 0) {
    const errorDetails = errors.map((error) => ({
      message: error.message,
      code: error.code
    }))

    throw new HttpError(`${errorMessage}: ${JSON.stringify(errorDetails)}`, 500)
  }

  if (response.body?.errors) {
    console.error('GraphQL Errors:', JSON.stringify(response.body.errors, null, 2))
    throw new HttpError(`${errorMessage}: ${response.body.errors[0].message}`, 500)
  }

  return data
}

export async function executeGraphQLQuery(
  session,
  query,
  { variables = {}, errorMessage = 'Failed to execute GraphQL query' } = {}
) {
  const client = new shopify.api.clients.Graphql({ session })

  try {
    const response = await client.request(query, {
      variables
    })
    const data = await handleGraphQLResponse(response, errorMessage)
    return data
  } catch (error) {
    console.error('GraphQL Error:', error)
    throw new HttpError(
      `GraphQL Error: ${errorMessage}: ${error.message}. Variables: ${JSON.stringify(variables)}. Shop: ${
        session?.shop
      }`,
      500
    )
  }
}
