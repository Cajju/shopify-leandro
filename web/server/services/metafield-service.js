import shopify from '../utils/shopify/index.js'

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
    const installationId = response.data.currentAppInstallation.id

    console.log('Fetched App Installation ID:', installationId)

    return installationId
  } catch (error) {
    console.error('Error fetching app installation ID:', error)
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
export const createAppDataMetafield = async (session, { ownerId, namespace, key, type, value }) => {
  const installationId = await fetchCurrentAppInstallationId(session)
  const variables = {
    metafieldsSetInput: [
      {
        namespace,
        key,
        type,
        value,
        ownerId: ownerId || installationId
      }
    ]
  }

  const client = new shopify.api.clients.Graphql({ session })

  try {
    const response = await client.request(CREATE_APP_DATA_METAFIELD_MUTATION, { variables })
    return response
  } catch (error) {
    console.error('Error creating metafield:', error)
    throw new Error('Failed to create metafield')
  }
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
