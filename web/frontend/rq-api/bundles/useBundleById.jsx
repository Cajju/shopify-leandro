import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import api from '../api'

export default function useBundleById(bundleId, isNew = false) {
  return useQuery({
    queryKey: [QUERY_KEYS.bundles, bundleId],
    queryFn: async () => {
      const response = await api.get(`/bundles/${bundleId}`)
      return response.data?.bundle || {}
    },
    enabled: !!bundleId && !isNew
  })
}
