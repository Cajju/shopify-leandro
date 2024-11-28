import { useState } from 'react'
import { Text, BlockStack, Card, InlineStack, Link, Image, Icon } from '@shopify/polaris'
import { XSmallIcon } from '@shopify/polaris-icons'
import { OnboardingBannerContainer, OnboardingBannerCloseAction, Heading } from './OnboardingBanner.styled'

export const OnboardingBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <Card>
      <BlockStack gap="6">
        <OnboardingBanner>
          <Heading variant="headingMd">Welcome to Bundle X!</Heading>
          <OnboardingBannerCloseAction>
            <Icon source={XSmallIcon} />
          </OnboardingBannerCloseAction>
        </OnboardingBanner>

        <Text variant="bodyMd">Follow the steps below to create a bundle and activate the app in your store.</Text>
        <InlineStack gap="3" as="div" wrap={true}>
          <InlineStack gap="3">
            <div className="flex items-center gap-3">
              <Image src="/assets/images/bundles/1_empty.svg" width={20} height={20} />
              <Link url="/bundles/create">Create your first bundle</Link>
            </div>
          </InlineStack>
          <InlineStack gap="3">
            <Text as="span" variant="bodyMd" fontWeight="bold">
              2
            </Text>
            <Link url="#">Add bundle widgets to your theme</Link>
          </InlineStack>
          <InlineStack gap="3">
            <Text as="span" variant="bodyMd" fontWeight="bold">
              3
            </Text>
            <Link url="#">Test the app in your store</Link>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  )
}
