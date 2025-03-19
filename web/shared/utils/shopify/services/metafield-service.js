import { executeGraphQLQuery } from '../../lib.js'
import shopify from '../index.js'

// Constant for the mutation
const CREATE_APP_DATA_METAFIELD_MUTATION = `
  mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafieldsSetInput) {
      metafields {
        id
        namespace
        key
      }
      userErrors {
        field
        message
      }
    }
  }
`

// Constant for the query to fetch the current app installation ID
const FETCH_CURRENT_APP_INSTALLATION_QUERY = `
  query {
    currentAppInstallation {
      id
    }
  }
`

// Constant for the query to fetch a metafield from AppInstallation
const FETCH_APP_INSTALLATION_METAFIELD_QUERY = `
  query FetchAppInstallationMetafield($namespace: String!, $key: String!) {
    currentAppInstallation {
      metafield(namespace: $namespace, key: $key) {
        id
        namespace
        key
        value
        type
      }
    }
  }
`

/**
 * Fetches the current app installation ID.
 * @returns {Promise<string>} - The app installation ID.
 */
export const fetchCurrentAppInstallationId = async (session) => {
  const client = new shopify.api.clients.Graphql({ session })
  try {
    const response = await client.request(FETCH_CURRENT_APP_INSTALLATION_QUERY)

    return response.data.currentAppInstallation.id
  } catch (error) {
    console.error('Error fetching app installation ID for shop:', session.shop, error)
    throw new Error('Failed to fetch app installation ID')
  }
}

/**
 * Creates an app-data metafield in Shopify.
 * @param {Object} session - The Shopify session object.
 * @param {Object} options - The options for creating the metafield.
 * @param {string} [options.ownerId] - The ID of the owner (AppInstallation). If not provided, the current app installation ID will be used.
 * @param {string} options.namespace - The namespace for the metafield.
 * @param {string} options.key - The key for the metafield.
 * @param {string} options.type - The type of the metafield.
 * @param {string} options.value - The value for the metafield.
 * @returns {Promise<Object>} - The response from the Shopify API.
 */
export const setAppDataMetafield = async (session, { ownerId, namespace, key, type, value }) => {
  const variables = {
    metafieldsSetInput: [
      {
        namespace,
        key,
        type,
        value,
        ownerId: ownerId || (await fetchCurrentAppInstallationId(session))
      }
    ]
  }

  const metafieldSetData = await executeGraphQLQuery(session, CREATE_APP_DATA_METAFIELD_MUTATION, {
    variables,
    errorMessage: 'Failed to create metafield'
  })
  return metafieldSetData.metafieldsSet.metafields[0]
}

/**
 * Fetches a metafield from the current app installation in Shopify.
 * @param {Object} session - The Shopify session object.
 * @param {Object} options - The options for fetching the metafield.
 * @param {string} options.namespace - The namespace for the metafield.
 * @param {string} options.key - The key for the metafield.
 * @returns {Promise<Object>} - The metafield data from the Shopify API.
 */
export const fetchAppInstallationMetafield = async (session, { namespace, key }) => {
  const variables = {
    namespace,
    key
  }

  const client = new shopify.api.clients.Graphql({ session })

  try {
    const response = await client.request(FETCH_APP_INSTALLATION_METAFIELD_QUERY, { variables })
    return response.data.currentAppInstallation.metafield
  } catch (error) {
    console.error('Error fetching app installation metafield:', error)
    throw new Error('Failed to fetch app installation metafield')
  }
}

const CREATE_METAFIELD_DEFINITION_MUTATION = `#graphql
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
        namespace
        key
        description
        ownerType
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Creates a metafield definition in Shopify.
 * @param {Object} session - The Shopify session object.
 * @param {Object} definition - The metafield definition input.
 * @param {string} definition.name - The name of the metafield.
 * @param {string} definition.namespace - The namespace for the metafield.
 * @param {string} definition.key - The key for the metafield.
 * @param {string} definition.description - The description of the metafield.
 * @param {string} definition.type - The type of the metafield.
 * @param {string} definition.ownerType - The type of resource that can have this metafield.
 * @returns {Promise<Object>} - The response from the Shopify API.
 */
export const createMetafieldDefinition = async (session, definition) => {
  try {
    const metafieldDefinitionData = await executeGraphQLQuery(session, CREATE_METAFIELD_DEFINITION_MUTATION, {
      variables: { definition },
      errorMessage: 'Failed to create metafield definition'
    })
    return metafieldDefinitionData.metafieldDefinitionCreate.createdDefinition
  } catch (error) {
    console.error('Error creating metafield definition:', error)
    throw new Error('Failed to create metafield definition')
  }
}

const UPDATE_METAFIELD_DEFINITION_MUTATION = `#graphql
  mutation UpdateMetafieldDefinition($definition: MetafieldDefinitionUpdateInput!) {
    metafieldDefinitionUpdate(definition: $definition) {
      updatedDefinition {
        id
        name
        namespace
        key
        description
        ownerType
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const updateMetafieldDefinition = async (session, definition) => {
  try {
    const metafieldDefinitionData = await executeGraphQLQuery(session, UPDATE_METAFIELD_DEFINITION_MUTATION, {
      variables: { definition },
      errorMessage: 'Failed to update metafield definition'
    })
    return metafieldDefinitionData.metafieldDefinitionUpdate.updatedDefinition
  } catch (error) {
    console.error('Error updating metafield definition:', error)
    throw new Error('Failed to update metafield definition')
  }
}

const METAFIELD_DELETE_MUTATION = `#graphql
mutation MetafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
  metafieldsDelete(metafields: $metafields) {
    deletedMetafields {
      key
      namespace
      ownerId
    }
    userErrors {
      field
      message
    }
  }
}
`

/**
 * Deletes a metafield from Shopify.
 * @param {Object} session - The Shopify session object.
 * @param {Object} metafield - The metafield to delete.
 * @returns {Promise<Object>} - The response from the Shopify API.
 */
export const deleteMetafield = async (session, metafield) => {
  const variables = {
    metafields: [{ key: metafield.key, namespace: metafield.namespace, ownerId: metafield.ownerId }]
  }

  const metafieldDeleteData = await executeGraphQLQuery(session, METAFIELD_DELETE_MUTATION, {
    variables,
    errorMessage: 'Failed to delete metafield'
  })
  return metafieldDeleteData.metafieldsDelete.deletedMetafields[0]
}
