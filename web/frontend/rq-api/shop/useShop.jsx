import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import api from '../api'

export default function useShop() {
  return useQuery({
    queryKey: [QUERY_KEYS.shop],
    queryFn: async () => {
      const res = await api.get(`/shop`)
      return res.data
    },
    refetchOnWindowFocus: false
  })
}
