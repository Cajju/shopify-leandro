import { BASE_URL } from './constants'

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

async function fetchWithErrorHandling(url, options = {}) {
  const shopDomainToControl = localStorage.getItem('shopDomainToControl')

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
    ...(shopDomainToControl && {
      'admin-control-shop': shopDomainToControl
    })
  }

  const config = {
    ...options,
    headers
  }

  // Handle timeout
  const { timeout = 30000 } = config
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  config.signal = controller.signal

  try {
    const response = await fetch(url, config)
    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type')

    if (!response.ok) {
      let errorData
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      } else {
        errorData = await response.text()
      }
      throw errorData?.error
    }

    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    return { data }
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

function buildUrlWithParams(baseURL, url, params) {
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url
  const urlObj = new URL(`${baseURL}/${cleanUrl}`, window.location.origin)
  Object.keys(params).forEach((key) => urlObj.searchParams.append(key, params[key]))
  return urlObj.toString()
}

function createApiClient(baseURL) {
  return {
    get: (url, { params = {}, options = {} } = {}) => {
      const fullUrl = buildUrlWithParams(baseURL, url, params) // Use baseURL directly
      return fetchWithErrorHandling(fullUrl, { ...options, method: 'GET' })
    },
    post: (url, data, { params = {}, options = {} } = {}) => {
      const fullUrl = buildUrlWithParams(baseURL, url, params) // Use baseURL directly
      return fetchWithErrorHandling(fullUrl, { ...options, method: 'POST', body: JSON.stringify(data) })
    },
    put: (url, data, { params = {}, options = {} } = {}) => {
      const fullUrl = buildUrlWithParams(baseURL, url, params) // Use baseURL directly
      return fetchWithErrorHandling(fullUrl, { ...options, method: 'PUT', body: JSON.stringify(data) })
    },
    patch: (url, data, { params = {}, options = {} } = {}) => {
      const fullUrl = buildUrlWithParams(baseURL, url, params) // Use baseURL directly
      return fetchWithErrorHandling(fullUrl, { ...options, method: 'PATCH', body: JSON.stringify(data) })
    },
    delete: (url, { params = {}, options = {} } = {}) => {
      const fullUrl = buildUrlWithParams(baseURL, url, params) // Use baseURL directly
      return fetchWithErrorHandling(fullUrl, { ...options, method: 'DELETE' })
    }
  }
}

const api = createApiClient(BASE_URL)
export const fetcher = createApiClient('')

export default api
