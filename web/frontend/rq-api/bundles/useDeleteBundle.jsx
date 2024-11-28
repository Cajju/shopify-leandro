import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import { useAppBridge } from '@shopify/app-bridge-react'
import api from '../api'

export default function useDeleteBundle() {
  const queryClient = useQueryClient()
  const { toast } = useAppBridge()

  return useMutation({
    mutationFn: async ({ bundleId }) => await api.delete(`/bundles/${bundleId}`),
    onSuccess: ({ bundles }, { bundleId }) => {
      queryClient.setQueryData([QUERY_KEYS.bundles], (old) => old.filter((b) => b._id !== bundleId))
      queryClient.setQueryData([QUERY_KEYS.bundles, bundleId], null)
      toast.show('Bundle deleted')
    }
  })
}
