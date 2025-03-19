import HttpError from '../../http-error.js'
import { executeGraphQLQuery } from '../../lib.js'
import shopify from '../index.js'
import { PAGINATION_ACTION } from '../../constants.js'
import sharedConfig from '../../config.js'
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

export const getProductMetafields = async (session, productId) => {
  const productMetafield = await executeGraphQLQuery(session, FETCH_PRODUCT_METAFIELDS_QUERY, {
    variables: { productId },
    errorMessage: 'We had an issue retrieving the product metafield'
  })
  return productMetafield.product.metafield
}

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

export const getProductColorPatterns = async (session, productId) => {
  // First get the color-pattern metafield
  const colorPatternMetafield = await getProductMetafields(session, productId)

  if (!colorPatternMetafield?.value) return []

  // Parse the metafield value
  let metaobjectIds
  try {
    metaobjectIds = JSON.parse(colorPatternMetafield.value)
  } catch (error) {
    // console.error('Error parsing metafield value:', error)
    throw new Error('Invalid metafield value format')
  }

  // Query for the metaobjects
  const metaobjects = await executeGraphQLQuery(session, FETCH_METAOBJECTS_QUERY, {
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

const GET_SHOP_PRODUCTS_QUERY = ({ action, position } = pagination) => `
query($query: String!, $${position}: Int!, $${action}: String) {
  products(${position}: $${position}, ${action}: $${action}, query: $query) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
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
          name,
          values
        }
        onlineStorePreviewUrl
        hasOnlyDefaultVariant
        variants(first: 100) {
          edges {
          node {
            id
            title
            price
            availableForSale
            inventoryQuantity
            compareAtPrice
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
      handle
      featuredImage {
        url
      }
      variantsCount {
        count
      }
      options {
        id
        name
        position
        values
      }
      priceRangeV2{
        minVariantPrice{
          amount
        }
      }
      hasOnlyDefaultVariant
      onlineStorePreviewUrl
      onlineStoreUrl
      variants(first: 100) {
        edges {
          node {
            id
            title
            price
            compareAtPrice
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

const CREATE_PRODUCT_BUNDLE_MUTATION = `
  mutation ProductBundleCreate($input: ProductBundleCreateInput!) {
    productBundleCreate(input: $input) {
      productBundleOperation {
        id
        product {
          id
        }
        __typename
      }
      userErrors {
        message
        field
        __typename
      }
      __typename
    }
  }
`

export const fetchProducts = async (session, options = {}) => {
  const { cursor = null, limit = 10, search = '', action } = options

  let pagination
  if (action === PAGINATION_ACTION.NEXT) {
    pagination = {
      position: 'first',
      action: 'after'
    }
  } else if (action === PAGINATION_ACTION.PREVIOUS) {
    pagination = {
      position: 'last',
      action: 'before'
    }
  } else {
    return next(new HttpError('Invalid pagination action', 400))
  }

  try {
    const productsData = await executeGraphQLQuery(session, GET_SHOP_PRODUCTS_QUERY(pagination), {
      variables: {
        query: search ? `title:*${search}*` : '',
        [pagination.position]: parseInt(limit),
        [pagination.action]: cursor === 'null' || !cursor ? null : cursor
      },
      errorMessage: 'We had an issue retrieving the products'
    })

    const { pageInfo } = productsData.products

    const products = await Promise.all(
      productsData.products.edges.map(async (edge) => {
        const productId = edge.node.id

        let colorsDictionary = []
        try {
          colorsDictionary = await getProductColorPatterns(session, productId)
        } catch (e) {
          // console.error('Error fetching color patterns:', e)
        }

        return {
          id: productId,
          title: edge.node.title,
          featuredImage: edge.node.featuredImage?.url,
          variantsCount: edge.node.variantsCount.count,
          optionsCount: edge.node.options.length,
          options: edge.node.options,
          variants: edge.node.variants.edges.map((edge) => ({ ...edge.node })),
          price: edge.node.variants.edges[0]?.node.price || null,
          compareAtPrice: edge.node.variants.edges[0]?.node?.compareAtPrice || 0,
          onlineStorePreviewUrl: edge.node.onlineStorePreviewUrl,
          colorsDictionary,
          hasOnlyDefaultVariant: edge.node.hasOnlyDefaultVariant
        }
      })
    )
    const client = new shopify.api.clients.Graphql({ session })
    const totalCount = await getTotalProductCount(client)

    return {
      products,
      totalCount,
      ...pageInfo
    }
  } catch (e) {
    throw new HttpError(`We had an issue retrieving the products: ${e.message}. Shop: ${session?.shop}`, 500)
  }
}

const GET_PRODUCT_BY_ID_QUERY = `#graphql
  query getProductById($id: ID!) {
    product(id: $id) {
      id
    }
  }
`

const getProductById = async (session, id) => {
  const productData = await executeGraphQLQuery(session, GET_PRODUCT_BY_ID_QUERY, {
    variables: { id },
    errorMessage: 'We had an issue retrieving the product'
  })
  return productData.product
}

/**
 * Fetches products by their IDs.
 *
 * @param {Object} session - The Shopify session object.
 * @param {string[]} productIds - An array of product IDs in the format ["gid://shopify/Product/4234234234", ...].
 * @returns {Promise<Object[]>} - A promise that resolves to an array of product objects.
 */
export const fetchProductsByIds = async (session, productIds) => {
  const productsData = await executeGraphQLQuery(session, GET_PRODUCTS_BY_IDS_QUERY, {
    variables: {
      ids: productIds
    },
    errorMessage: 'We had an issue retrieving the products'
  })

  const products = await Promise.all(
    productsData.nodes
      .filter((node) => node !== null)
      .map(async (node) => {
        const productId = node.id
        let colorsDictionary = []
        try {
          colorsDictionary = await getProductColorPatterns(session, productId)
        } catch (e) {
          // console.error('Error fetching color patterns:', e)
        }

        return {
          id: node.id,
          title: node.title,
          featuredImage: node.featuredImage?.url,
          variantsCount: node.variantsCount.count,
          optionsCount: node.options.length,
          options: node.options,
          variants: node.variants.edges.map((edge) => ({ ...edge.node })),
          price: parseFloat(node.variants.edges[0]?.node.price) || null,
          compareAtPrice: parseFloat(node.variants.edges[0]?.node?.compareAtPrice || 0),
          onlineStorePreviewUrl: node.onlineStorePreviewUrl,
          onlineStoreUrl: node.onlineStoreUrl,
          handle: node.handle,
          colorsDictionary,
          hasOnlyDefaultVariant: node.hasOnlyDefaultVariant,
          priceRangeV2: node.priceRangeV2
        }
      })
  )

  return products
}

export const fetchProductsVariantsByIds = async (session, productsVariantsIds) => {
  const productsIds = productsVariantsIds.map((product) => product.id)
  const productsWithAllVariants = await fetchProductsByIds(session, productsIds)

  //filtering out all variants that arn't included in the productsVariantsIds array
  const productsWithFilteredOutVariants = productsWithAllVariants.map((product2) => {
    const product2Clone = { ...product2 }
    const matchingProduct1 = productsVariantsIds.find((product1) => product1.id === product2.id)

    if (!product2.hasOnlyDefaultVariant) {
      const filteredVariants = product2Clone.variants.filter((variant2) => {
        if (!matchingProduct1) {
          return false // Skip filtering if no matching product
        }

        const foundVariant = matchingProduct1.variants.find((variant1) => variant1.id === variant2.id)
        return foundVariant // Return true if a match is found
      })
      product2Clone.variants = filteredVariants
    }
    return product2Clone
  })
  return productsWithFilteredOutVariants
}

/**
 * Creates a product bundle in Shopify.
 *
 * @param {Object} session - The Shopify session object.
 * @param {Object} input - The input object for creating the product bundle.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the job ID.
 */
export const createProductBundle = async (session, input) => {
  const productBundleData = await executeGraphQLQuery(session, CREATE_PRODUCT_BUNDLE_MUTATION, {
    variables: { input },
    errorMessage: 'Error creating the product bundle'
  })

  if (!productBundleData.productBundleCreate || !productBundleData.productBundleCreate.productBundleOperation) {
    throw new Error('Unexpected response structure from productBundleCreate mutation')
  }

  return {
    jobId: productBundleData.productBundleCreate.productBundleOperation.id
  }
}

const PRODUCT_SET_MUTATION = `#graphql
  mutation productSet($input: ProductSetInput!) {
    productSet(input: $input) {
      product {
        id
        title
        featuredMedia {
          id
          mediaContentType
          preview{
            image{
              altText
              height
              width
              url
            }
          }
          mediaErrors {
            message
            code
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              price
              compareAtPrice
              selectedOptions{
                name
                value
                optionValue{
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const setProduct = async (session, input) => {
  // console.log('input', input)
  const productData = await executeGraphQLQuery(session, PRODUCT_SET_MUTATION, {
    variables: { input },
    errorMessage: 'Error setting the product'
  })
  return productData.productSet.product
}

const CREATE_PRODUCT_MUTATION = `#graphql
mutation CreateProductWithStatus ($input: ProductInput!){
    productCreate(input: $input) {
      product {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const createProduct = async (session, input) => {
  const productData = await executeGraphQLQuery(session, CREATE_PRODUCT_MUTATION, {
    variables: { input },
    errorMessage: 'Error creating the product'
  })
  return productData.productCreate.product
}

const PUBLICATIONS_QUERY = `#graphql
  query publications {
    publications(first: 1) {
      edges {
        node {
          id
          name
          autoPublish
        }
      }
    }
  }
`

export const getOnlineStorePublicationId = async (session) => {
  const publicationData = await executeGraphQLQuery(session, PUBLICATIONS_QUERY, {
    errorMessage: 'Error fetching online store publication ID'
  })

  const onlineStorePublication = publicationData.publications.edges[0]?.node

  if (!onlineStorePublication) {
    throw new Error('Online store publication not found')
  }

  return onlineStorePublication.id
}

const CREATE_PRODUCT_PUBLICATION_MUTATION = `#graphql
  mutation PublishablePublish($collectionId: ID!, $publicationId: ID!) {
    publishablePublish(id: $collectionId, input: {publicationId: $publicationId}) {
      publishable {
        publishedOnPublication(publicationId: $publicationId)
      }
      userErrors {
        field
        message
      }
    }
  }
`
export const createPublishablePublish = async (session, variables) => {
  const productPublicationData = await executeGraphQLQuery(session, CREATE_PRODUCT_PUBLICATION_MUTATION, {
    variables,
    errorMessage: 'Error creating the product publication'
  })
  return productPublicationData.publishablePublish.publishable
}

const UPDATE_PRODUCT_MUTATION = `#graphql
  mutation updateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const createProductAndPublishToOnlineStore = async (session, input) => {
  const product = await setProduct(session, input)
  const onlineStorePublicationId = await getOnlineStorePublicationId(session)
  await createPublishablePublish(session, { collectionId: product.id, publicationId: onlineStorePublicationId })
  return product
}

export const updateProduct = async (session, input) => {
  const productData = await executeGraphQLQuery(session, UPDATE_PRODUCT_MUTATION, {
    variables: { input },
    errorMessage: 'Error updating the product'
  })
  return productData.productUpdate.product
}

const DELETE_PRODUCT_MUTATION = `#graphql
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`

export const deleteProduct = async (session, input) => {
  const productData = await executeGraphQLQuery(session, DELETE_PRODUCT_MUTATION, {
    variables: { input },
    errorMessage: 'Error deleting the product'
  })
  return productData.productDelete.deletedProductId
}

export const fetchProductPreviewUrls = async (session, productIds) => {
  const PREVIEW_URLS_QUERY = `
    query getProductUrls($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          onlineStorePreviewUrl
          onlineStoreUrl
        }
      }
    }
  `

  const productsData = await executeGraphQLQuery(session, PREVIEW_URLS_QUERY, {
    variables: {
      ids: productIds
    },
    errorMessage: 'We had an issue retrieving the product preview URLs'
  })

  return productsData.nodes.reduce((acc, product) => {
    if (product) {
      acc[product.id] = product.onlineStoreUrl || product.onlineStorePreviewUrl
    }
    return acc
  }, {})
}

export const setProductForBundle = async (session, { id, title, status, productType, price, compareAtPrice }) => {
  let productBundleData
  const productInput = {
    id: id,
    title: title,
    status: status,
    vendor: sharedConfig.appNameLabel,
    claimOwnership: {
      bundles: true
    },
    productType: productType,
    productOptions: [
      {
        name: 'Title',
        position: 1,
        values: [
          {
            name: 'Default Title'
          }
        ]
      }
    ],
    variants: [
      {
        optionValues: [
          {
            optionName: 'Title',
            name: 'Default Title'
          }
        ],
        price: price.toString(),
        compareAtPrice: compareAtPrice.toString()
      }
    ]
  }

  if (!id) {
    productBundleData = await createProductAndPublishToOnlineStore(session, productInput)
  } else {
    const product = await getProductById(session, id)
    if (product) {
      productBundleData = await setProduct(session, productInput)
    } else {
      productBundleData = await createProductAndPublishToOnlineStore(session, productInput)
    }
  }

  return productBundleData
}

export const JOB_POLLER_QUERY = `
  query JobPoller($jobId: ID!, $componentLimit: Int = 50) {
    productOperation(id: $jobId) {
      ... on ProductBundleOperation {
        id
        status
        product {
          ...ProductFragment
          bundleComponents(first: $componentLimit) {
            edges {
              node {
                ...ProductComponentFragment
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        userErrors {
          field
          message
          code
          __typename
        }
        __typename
      }
      __typename
    }
  }
  
  fragment ProductFragment on Product {
    id
    title
    handle
    featuredImage {
      id
      url: url(transform: {maxWidth: 80, maxHeight: 80})
      altText
      __typename
    }
    options(first: 3) {
      id
      name
      values
      __typename
    }
    hasOnlyDefaultVariant
    variants(first: 250) {
      edges {
        node {
          id
          price
          compareAtPrice
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  
  fragment ProductComponentFragment on ProductBundleComponent {
    componentProduct {
      ...ProductFragment
      __typename
    }
    optionSelections {
      componentOption {
        id
        name
        __typename
      }
      parentOption {
        id
        name
        __typename
      }
      values {
        selectionStatus
        value
        __typename
      }
      __typename
    }
    quantity
    quantityOption {
      name
      parentOption {
        id
        __typename
      }
      values {
        name
        quantity
        __typename
      }
      __typename
    }
    __typename
  }
  `

export async function pollJobStatus(session, jobId, options = {}) {
  const { timeout = 20000, pollInterval = 1000, componentLimit = 50, onComplete, onFailed } = options

  const startTime = Date.now()

  while (true) {
    try {
      const jobData = await executeGraphQLQuery(session, options.jobPollerQuery, {
        variables: {
          componentLimit,
          jobId
        },
        errorMessage: 'We had an issue polling the job status'
      })

      const status = jobData.productOperation.status

      if (status === 'COMPLETE') {
        return onComplete ? onComplete(jobData.productOperation) : jobData.productOperation
      } else if (status === 'FAILED') {
        const error = new Error('Job failed: ' + JSON.stringify(jobData.productOperation.userErrors))
        if (onFailed) {
          onFailed(error)
        } else {
          throw error
        }
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Job timed out after ${timeout / 1000} seconds`)
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    } catch (error) {
      console.error('Error polling job status:', error)
      throw error
    }
  }
}

const PRODUCTS_IMAGES_QUERY = `
    query getProductsImages($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          featuredMedia {
            id
            mediaContentType
            preview{
              image{
                altText
                height
                width
                url
              }
            }
            mediaErrors {
              message
              code
            }
          }
        }
      }
    }
  `

export const fetchProductsFeaturedImages = async (session, productIds) => {
  const productsImagesData = await executeGraphQLQuery(session, PRODUCTS_IMAGES_QUERY, {
    variables: {
      ids: productIds
    },
    errorMessage: 'We had an issue retrieving the products images'
  })

  const featuredImages = productsImagesData.nodes.reduce((acc, product) => {
    if (product?.featuredMedia?.preview?.image?.url) {
      acc.push({ productId: product.id, imageUrl: product.featuredMedia.preview.image.url })
    }

    return acc
  }, [])

  return featuredImages
}
