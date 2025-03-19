// Get bundles
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import api from '../api'

const useBundles = (status = 'all') => {
  return useQuery({
    queryKey: [QUERY_KEYS.bundles, ...(status === 'all' ? [] : [status])],
    queryFn: async () => {
      const response = await api.get(`/bundles`, { params: { status } })
      const data = response.data?.bundles || []
      return data
    },
    meta: {
      errorMessage: "couldn't load bundles"
    },
    experimental_prefetchInRender: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: false // Don't automatically refetch at intervals
  })
}

export default useBundles
