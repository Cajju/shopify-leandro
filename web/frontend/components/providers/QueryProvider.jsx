import { useAppBridge } from '@shopify/app-bridge-react'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Sets up the QueryClientProvider from react-query.
 * @desc See: https://react-query.tanstack.com/reference/QueryClientProvider#_top
 */
export function QueryProvider({ children }) {
  const { toast } = useAppBridge()
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.errorMessage) {
          toast.show(`Something went wrong: ${query.meta.errorMessage}`, { isError: true, duration: 5000 })
        } else {
          toast.show(`Something went wrong: ${error?.message || 'Unknown error'}`, { isError: true, duration: 5000 })
        }
      }
    }),
    mutationCache: new MutationCache()
  })

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
