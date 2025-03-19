import { BrowserRouter } from 'react-router-dom'
import Routes from './Routes'
import { EventTrackingProvider, QueryProvider, PolarisProvider, Layout, Navbar } from './components'

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob('./pages/**/!(*.test.[jt]sx)*.([jt]sx)', {
    eager: true
  })

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <EventTrackingProvider>
            <Navbar />
            <Layout>
              <Routes pages={pages} />
            </Layout>
          </EventTrackingProvider>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  )
}
