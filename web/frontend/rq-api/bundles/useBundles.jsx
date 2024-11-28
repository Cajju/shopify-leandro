// Get bundles
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import api from '../api'

const useBundles = (status = 'all') => {
  return useQuery({
    queryKey: [QUERY_KEYS.bundles, ...(status === 'all' ? [] : [status])],
    queryFn: async () => {
      const response = await api.get(`/bundles`, { params: { status } })
      return response.data?.bundles || []
    },
    meta: {
      errorMessage: "couldn't load bundles"
    }
  })
}

export default useBundles
