import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import { useAppBridge } from '@shopify/app-bridge-react'
import api from '../api'

const useSetBundle = () => {
  const { toast } = useAppBridge()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bundleId = 'new', data }) => {
      const res = await api.put(`/bundles/${bundleId}`, { data })
      return res.data
    },
    onSuccess: ({ bundles, bundle }, { bundleId, onSuccess }) => {
      queryClient.setQueryData([QUERY_KEYS.bundles], bundles)
      queryClient.setQueryData([QUERY_KEYS.bundles, bundleId], bundle)
      toast.show('Bundle updated')
      onSuccess?.()
    },
    onError: (error) => {
      console.log(error)
    }
  })
}

export default useSetBundle
