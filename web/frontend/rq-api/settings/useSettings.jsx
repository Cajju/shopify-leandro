import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../constants'
import api from '../api'

export const useSettings = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.settings],
    queryFn: async () => {
      const response = await api.get('/settings')
      return response.data.settings
    },
    experimental_prefetchInRender: true,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5
  })
}

export default useSettings
