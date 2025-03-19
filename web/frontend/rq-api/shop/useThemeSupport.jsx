import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../constants'
import api from '../api'

export default function useThemeSupport() {
  return useQuery({
    queryKey: [QUERY_KEYS.shop, 'theme', 'support'],
    queryFn: async () => {
      const res = await api.get(`/shop/theme-support`)
      return res.data
    }
  })
}
