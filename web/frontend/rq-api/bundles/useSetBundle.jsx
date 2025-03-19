import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, BASE_URL } from '../constants'
import { useAppBridge } from '@shopify/app-bridge-react'
import api from '../api'
import { STATUS_TYPES } from '../../../shared/utils/bundles/bundles-constants'

const useSetBundle = () => {
  const { toast } = useAppBridge()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [QUERY_KEYS.bundles, 'set'],
    mutationFn: async ({ bundleId = 'new', data }) => {
      const res = await api.put(`/bundles/${bundleId}`, { data })
      return res.data
    },
    onSuccess: ({ bundles, bundle }, { bundleId, onSuccess }) => {
      queryClient.setQueryData([QUERY_KEYS.bundles], bundles)
      queryClient.setQueryData([QUERY_KEYS.bundles, bundleId], bundle)

      const message = bundle.status === STATUS_TYPES.DRAFT ? 'Bundle set as draft' : 'Bundle activated'
      toast.show(message)

      onSuccess?.()
    },
    onError: (error) => {
      toast.show('Error occured. Bundle not saved', {
        isError: true
      })
      console.log(error)
    }
  })
}

export default useSetBundle
