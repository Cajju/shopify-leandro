import { useMutation, useQueryClient } from '@tanstack/react-query'
import { STATUS_TYPES } from '@shared/utils/bundles/bundles-constants'
import { QUERY_KEYS, BASE_URL } from '../constants'
import { useAppBridge } from '@shopify/app-bridge-react'
import api from '../api'

const useChangeBundleStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useAppBridge()

  return useMutation({
    mutationFn: async ({ bundleId, newStatus }) => {
      const response = await api.post(`/bundles/change-status`, {}, { params: { bundleId, newStatus } })
      return response.data
    },
    onSuccess: ({ bundles, bundle }, { newStatus, onSuccess }) => {
      queryClient.setQueryData([QUERY_KEYS.bundles], bundles)
      queryClient.setQueryData([QUERY_KEYS.bundles, bundle._id], bundle)
      toast.show(`Bundle ${newStatus === STATUS_TYPES.ACTIVE ? 'activated' : 'deactivated'}`)
      onSuccess?.()
    }
  })
}

export default useChangeBundleStatus
