import { BlockStack } from '@shopify/polaris'
import AdminControlBanner from './AdminControlBanner'
import { OnboardingBanner } from './OnboardingBanner/OnboardingBanner'

const PageBanners = () => {
  return (
    <BlockStack gap="200">
      <AdminControlBanner />
    </BlockStack>
  )
}

export default PageBanners
