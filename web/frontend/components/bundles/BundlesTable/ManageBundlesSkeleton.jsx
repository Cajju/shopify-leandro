import React, { useEffect } from 'react'
import { Card, InlineStack, SkeletonDisplayText, BlockStack, SkeletonPage, Box, SkeletonTabs } from '@shopify/polaris'
import { useAppBridge } from '@shopify/app-bridge-react'

export default function ManageBundlesSkeleton() {
  const shopify = useAppBridge()

  useEffect(() => {
    shopify.loading(true)
    return () => shopify.loading(false)
  }, [shopify])

  const tblRow = (
    <InlineStack gap="200" align="space-evenly">
      <Box minWidth="24%">
        <SkeletonDisplayText size="small" />
      </Box>
      <Box minWidth="24%">
        <SkeletonDisplayText size="small" />
      </Box>
      <Box minWidth="24%">
        <SkeletonDisplayText size="small" />
      </Box>
      <Box minWidth="24%">
        <SkeletonDisplayText size="small" />
      </Box>
    </InlineStack>
  )

  return (
    <>
      <SkeletonPage title="Bundles" primaryAction>
        <BlockStack gap="400">
          <Card padding="400">
            <BlockStack gap="800">
              <SkeletonTabs count={3} />
              {tblRow}
              {tblRow}
            </BlockStack>
          </Card>
        </BlockStack>
      </SkeletonPage>
    </>
  )
}
