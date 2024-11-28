import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import api from '../api'

const useProducts = (options = {}) => {
  const { page = 1, limit = 10, searchQuery = '' } = options

  return useQuery({
    queryKey: [QUERY_KEYS.products, page, limit, searchQuery],
    queryFn: async () => {
      const res = await api.get(`/shop/products`, {
        params: {
          page,
          limit,
          search: searchQuery
        }
      })

      const { products, totalCount, hasNextPage, endCursor } = res.data || {}

      return {
        products: products || [],
        totalCount: totalCount || 0,
        hasNextPage: hasNextPage || false,
        endCursor: endCursor || null
      }
    },
    keepPreviousData: true
  })
}

export default useProducts
