import { handleGraphQLResponse } from '../../lib.js'
import shopify from '../index.js'

const CART_TRANSFORM_EXTENSION_NAME = 'cart-transformer'

const SHOPIFY_FUNCTIONS_QUERY = `
    query {
      shopifyFunctions(first: 25) {
        nodes {
          app {
            title
          }
          apiType
          title
          id
        }
      }
    }
  `

const CART_TRANSFORM_CREATE_MUTATION = `mutation($functionId: String!) {
  cartTransformCreate(functionId: $functionId){
    cartTransform{
      id
    }
    userErrors{
      code
      message
    }
  }   
}`

export const registerCartTransform = async (session) => {
  const client = new shopify.api.clients.Graphql({ session })

  const shopifyFunctionsResponse = await client.request(SHOPIFY_FUNCTIONS_QUERY)
  const shopifyFunctionsData = await handleGraphQLResponse(
    shopifyFunctionsResponse,
    'Failed to query shopify functions'
  )

  const functionId = shopifyFunctionsData.shopifyFunctions.nodes.find(
    (node) => node.title === CART_TRANSFORM_EXTENSION_NAME
  ).id

  const cartTransformCreateResponse = await client.request(CART_TRANSFORM_CREATE_MUTATION, {
    variables: {
      functionId
    }
  })
  try {
    const cartTransformCreateData = await handleGraphQLResponse(
      cartTransformCreateResponse,
      'Failed to register cart transform'
    )
    return cartTransformCreateData.cartTransformCreate.cartTransform.id
  } catch (error) {
    if (!error.message.includes('FUNCTION_ALREADY_REGISTERED')) {
      throw error
    }
  }
}

const CART_TRANSFORM_ID_QUERY = `
  query {
    cartTransforms(first:1) {
      edges{
        node{
          id
        }
      }
    }
      
  }
`

export const getCartTransformId = async (session) => {
  const client = new shopify.api.clients.Graphql({ session })
  const cartTransformIdResponse = await client.request(CART_TRANSFORM_ID_QUERY)
  const cartTransformIdData = await handleGraphQLResponse(cartTransformIdResponse, 'Failed to get cart transform id')

  if (!cartTransformIdData.cartTransforms?.edges?.[0]?.node?.id) {
    throw new Error('No cart transform found')
  }
  return cartTransformIdData.cartTransforms.edges[0].node.id
}
