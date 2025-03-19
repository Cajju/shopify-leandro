import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import api from '../api'

export default function useShop({ enabled = true } = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.shop],
    queryFn: async () => {
      const res = await api.get(`/shop`)
      return res.data
    },
    refetchOnWindowFocus: false,
    enabled: enabled ?? true,
    staleTime: 1000 * 60 * 5
  })
}
