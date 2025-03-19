import { executeGraphQLQuery, handleGraphQLResponse } from '../../lib.js'
import shopify from '../index.js'

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

const DISCOUNT_AUTOMATIC_APP_CREATE_MUTATION = `
mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
  discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
    automaticAppDiscount {
      discountId
      appDiscountType {
        appKey
        functionId
      }
      combinesWith {
        orderDiscounts
        productDiscounts
        shippingDiscounts
      }
    }
    userErrors {
      field
      message
    }
  }
}`

const PRODUCT_DISCOUNT_ID_QUERY = `
  query {
    automaticAppDiscounts(first:1) {
      edges{
        node{
          id
        }
      }
    }
  }
`

const DISCOUNT_AUTOMATIC_APP_UPDATE_MUTATION = `
  mutation discountAutomaticAppUpdate($automaticAppDiscount: DiscountAutomaticAppInput!, $id: ID!) {
      discountAutomaticAppUpdate(automaticAppDiscount: $automaticAppDiscount, id: $id) {
        automaticAppDiscount {
          discountId
          title
          startsAt
          endsAt
          status
          appDiscountType {
            appKey
            functionId
          }
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
        }
        userErrors {
          field
          message
        }
      }
    }

`

export const getFunctionId = async (session, functionName) => {
  const shopifyFunctionsData = await executeGraphQLQuery(session, SHOPIFY_FUNCTIONS_QUERY, {
    errorMessage: 'Failed to query shopify functions'
  })
  const functionData = shopifyFunctionsData.shopifyFunctions.nodes.find((node) => node.title === functionName)
  if (!functionData?.id) {
    throw new Error(`Function ${functionName} not found`)
  }
  return functionData.id
}

export const createAutomaticProductDiscount = async (session, variables) => {
  const discountAutomaticAppCreateData = await executeGraphQLQuery(session, DISCOUNT_AUTOMATIC_APP_CREATE_MUTATION, {
    variables,
    errorMessage: 'Failed to create automatic product discount'
  })

  return discountAutomaticAppCreateData
}

export const getProductDiscountId = async (session) => {
  const client = new shopify.api.clients.Graphql({ session })

  const productDiscountIdResponse = await client.request(PRODUCT_DISCOUNT_ID_QUERY)
  const productDiscountIdData = await handleGraphQLResponse(
    productDiscountIdResponse,
    'Failed to get product discount id'
  )

  return productDiscountIdData.automaticAppDiscounts.edges[0].node.id
}

export const updateAutomaticProductDiscount = async (session, variables) => {
  const discountAutomaticAppUpdateResponse = await executeGraphQLQuery(
    session,
    DISCOUNT_AUTOMATIC_APP_UPDATE_MUTATION,
    {
      variables,
      errorMessage: 'Failed to update automatic product discount'
    }
  )

  return discountAutomaticAppUpdateResponse
}
