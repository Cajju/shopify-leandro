import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '../constants'
import api from '../api'
import useOptimisticMutation from '../../hooks/useOptimisticMutation'
import { flattenObject, unflattenObject } from '../lib'

const useSetSettings = () => {
  const queryClient = useQueryClient()

  return useOptimisticMutation({
    mutationFn: async ({ settings, patch }) => {
      const response = await api.put(
        `/settings`,
        { settings },
        {
          params: patch ? { patch } : undefined
        }
      )
      return response.data
    },
    optimistic: ({ settings, patch } = variables) => {
      return [
        {
          queryKey: [QUERY_KEYS.settings],
          updater: (currentData) => {
            if (patch) {
              return unflattenObject({
                ...flattenObject(currentData),
                ...flattenObject(settings)
              })
            }
            return settings
          }
        }
      ]
    },
    onSuccess: (_, { onSuccess }) => {
      onSuccess?.()
    }
  })
}

export default useSetSettings
