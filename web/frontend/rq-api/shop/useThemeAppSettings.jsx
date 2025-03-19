import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../constants'
import api from '../api'

export default function useThemeAppSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.shop, 'theme', 'appSettings'],
    queryFn: async () => {
      const res = await api.get(`/shop/theme-app-settings`)
      return res.data
    },
    refetchOnFocus: true
  })
}
