import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * A custom hook for handling optimistic updates with React Query mutations
 * @template TData The type of data returned by the mutation
 * @template TVariables The type of variables passed to the mutation
 *
 * @typedef {Object} QueryHandler
 * @property {string[]} queryKey - React Query key to update
 * @property {(oldData: any) => any} updater - Function to update the cached data
 * @property {boolean} [updateReturnedData] - Whether to merge mutation response with cached data
 *
 * @typedef {Object} StateHandler
 * @property {() => any} getData - Function to get current state
 * @property {(data: any) => void} setData - Function to set new state
 * @property {(oldData: any) => any} updater - Function to update the state
 *
 * @param {Object} params - The parameters object
 * @param {(variables: TVariables) => Promise<TData>} params.mutationFn - The async function that performs the actual mutation
 * @param {(variables: TVariables) => (QueryHandler | StateHandler)[]} params.optimistic - Function that returns handlers for optimistic updates
 * @param {(data: TData, variables: TVariables, context: any) => void} [params.onSuccess] - Called when mutation succeeds
 * @param {(error: Error, variables: TVariables, context: any) => void} [params.onError] - Called when mutation fails
 * @returns {import('@tanstack/react-query').UseMutationResult<TData, Error, TVariables>}
 *
 * @example
 * const mutation = useOptimisticMutation({
 *   mutationFn: (newTodo) => api.createTodo(newTodo),
 *   optimistic: (variables) => [{
 *     queryKey: ['todos'],
 *     updater: (old) => [...old, variables],
 *     updateReturnedData: true
 *   }],
 *   onSuccess: (data) => console.log('Todo created:', data),
 *   onError: (error) => console.error('Failed:', error)
 * });
 *
 * // Usage
 * mutation.mutate({ title: 'New Todo' });
 */
const useOptimisticMutation = ({ mutationFn, optimistic, onSuccess, onError }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      const results = []

      try {
        const handlers = optimistic(variables)

        for (const handler of handlers) {
          if ('queryKey' in handler) {
            const { queryKey, updater } = handler
            if (!updater) continue
            let didCancelFetch = false

            // If query is currently fetching, we cancel it to avoid overwriting our optimistic update.
            // This would happen if query responds with old data after our optimistic update is applied.
            const isFetching = queryClient.getQueryState(queryKey)?.fetchStatus === 'fetching'
            if (isFetching) {
              await queryClient.cancelQueries(queryKey)
              didCancelFetch = true
            }

            // Get previous data before optimistic update
            const previousData = queryClient.getQueryData(queryKey)
            // Rollback function we call if mutation fails
            const rollback = () => queryClient.setQueryData(queryKey, previousData)
            // Invalidate function to call after mutation is done if we cancelled a fetch.
            // This ensures that we get both the optimistic update and fresh data from the server.
            const invalidate = () => queryClient.invalidateQueries(queryKey)

            // Update data in React Query cache
            queryClient.setQueryData(queryKey, updater)

            // Add to results that we read in onError and onSettled
            results.push({
              rollback,
              invalidate,
              didCancelFetch
            })
          } else {
            // If no query key then we're not operating on the React Query cache
            // We expect to have a `getData` and `setData` function
            const { getData, setData, updater } = handler
            const previousData = getData()
            const rollback = () => setData(previousData)
            setData(updater)
            results.push({
              rollback
            })
          }
        }
      } catch (error) {
        console.log(error)
        throw error
      }
      return { results }
    },
    // On error revert all queries to their previous data
    onError: (error, variables, context) => {
      console.log(error)
      if (context?.results) {
        context.results.forEach(({ rollback }) => {
          rollback()
        })
      }

      onError?.(error, variables, context)
    },
    // also if there is more data that should be returned and updated after success update it also in cache.
    onSuccess: (data, variables, context) => {
      const handlers = optimistic(variables)

      for (const handler of handlers) {
        if ('queryKey' in handler) {
          const { queryKey, updateReturnedData } = handler

          if (updateReturnedData) {
            queryClient.setQueryData(queryKey, (prev) => ({ ...prev, ...data }))
          }
        }
      }

      onSuccess?.(data, variables, context)
    },
    // When mutation is done invalidate cancelled queries so they get refetched
    onSettled: (data, error, variables, context) => {
      if (context?.results) {
        context.results.forEach(({ didCancelFetch, invalidate }) => {
          if (didCancelFetch && invalidate) {
            invalidate()
          }
        })
      }
    }
  })
}

export default useOptimisticMutation
