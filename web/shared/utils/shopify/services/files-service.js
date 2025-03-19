import { executeGraphQLQuery } from '../../lib.js'
import shopify from '../index.js'

const PRODUCT_CREATE_MEDIA = `
mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
  productCreateMedia(productId: $productId, media: $media) {
    media {
      ... on Media {
        mediaContentType
        __typename
      }
      ...MediaFragment
      __typename
    }
    mediaUserErrors {
      field
      message
      __typename
    }
    __typename
  }
}

fragment MediaFragment on File {
  id
  alt
  status: fileStatus
  mediaErrors: fileErrors {
    message
    code
    __typename
  }
  preview {
    status
    image {
      id
      transformedSrc: url(transform: {maxWidth: 200, maxHeight: 200})
      originalSrc: url
      width
      height
      __typename
    }
    __typename
  }
  ... on MediaImage {
    mimeType
    image {
      id
      originalSrc: url
      width
      height
      __typename
    }
    __typename
  }
  ... on ExternalVideo {
    embeddedUrl
    __typename
  }
  ... on Video {
    filename
    sources {
      height
      mimeType
      url
      width
      __typename
    }
    __typename
  }
  ... on Model3d {
    filename
    originalSource {
      url
      format
      mimeType
      filesize
      __typename
    }
    sources {
      format
      url
      filesize
      __typename
    }
    boundingBox {
      size {
        x
        y
        z
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}
`

const STAGED_UPLOADS_CREATE_MUTATION = `
mutation UploadStagedMedia($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
        __typename
      }
      __typename
    }
    userErrors {
      field
      message
      __typename
    }
    __typename
  }
}
`

export function getMediaContentType(mimeType) {
  const mimeTypeMap = {
    'image/jpeg': 'IMAGE',
    'image/png': 'IMAGE',
    'image/gif': 'IMAGE',
    'image/webp': 'IMAGE',
    'image/svg+xml': 'IMAGE',
    'video/mp4': 'VIDEO',
    'video/webm': 'VIDEO',
    'video/ogg': 'VIDEO',
    'model/gltf-binary': 'MODEL_3D',
    'model/gltf+json': 'MODEL_3D'
  }

  return mimeTypeMap[mimeType] || 'IMAGE'
}

export async function createStagedUploads(session, filesToUpload) {
  const stagedUploadsInput = filesToUpload.map(({ media }) => ({
    filename: media.name,
    mimeType: media.type,
    httpMethod: 'POST',
    fileSize: `${media.size}`,
    resource: getMediaContentType(media.type)
  }))

  const stagedUploads = await executeGraphQLQuery(session, STAGED_UPLOADS_CREATE_MUTATION, {
    variables: { input: stagedUploadsInput },
    errorMessage: 'Error creating staged uploads'
  })

  return stagedUploads.stagedUploadsCreate.stagedTargets
}

export async function uploadFilesToStagedTargets(stagedTargets, filesToUpload) {
  for (let i = 0; i < filesToUpload.length; i++) {
    const { file } = filesToUpload[i]

    const target = stagedTargets[i]
    const uploadFormData = new FormData()

    // Append necessary parameters
    target.parameters.forEach((param) => {
      uploadFormData.append(param.name, param.value)
    })

    uploadFormData.append('file', new Blob([file]))

    const response = await fetch(target.url, {
      method: 'POST',
      body: uploadFormData
    })

    if (!response.ok) {
      const errorResponse = await response.text() // Get the response body
      console.error('Upload error response:', errorResponse)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorResponse}`)
    }
  }
  return filesToUpload
}

export async function createProductMedia(session, productId, stagedTargets, uploadedFiles, productImages) {
  const mediaCreateInput = [
    ...stagedTargets
      .map((target, index) => {
        const originalSource = target.resourceUrl // Ensure this is set correctly
        if (!originalSource) {
          console.warn(`Missing originalSource for uploaded file at index ${index}`)
          return null // Skip this entry if originalSource is missing
        }
        return {
          mediaContentType: getMediaContentType(uploadedFiles[index].media.type),
          originalSource: originalSource,
          alt: uploadedFiles[index].media.altText || ''
        }
      })
      .filter(Boolean)
  ]
  // console.log('mediaCreateInput', mediaCreateInput)

  // Check if mediaCreateInput is empty
  if (mediaCreateInput.length === 0) {
    throw new Error('No valid media items to create.')
  }

  const productMedia = await executeGraphQLQuery(session, PRODUCT_CREATE_MEDIA, {
    variables: {
      productId: productId,
      media: mediaCreateInput
    },
    errorMessage: 'Error creating product media'
  })

  return productMedia.productCreateMedia.media
}
