import React from 'react'
import {
  Layout,
  Card,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  BlockStack,
  SkeletonPage,
  Box
} from '@shopify/polaris'

export default function BundleFormSkeleton({ isNew }) {
  return (
    <SkeletonPage title={isNew ? 'New bundle' : 'Edit bundle'} primaryAction>
      <BlockStack gap="400">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <InlineStack align="center">
                  <Box minWidth="30%">
                    <SkeletonDisplayText size="extraLarge" />
                  </Box>
                  <Box minWidth="30%">
                    <SkeletonDisplayText size="extraLarge" />
                  </Box>
                  <Box minWidth="30%">
                    <SkeletonDisplayText size="extraLarge" />
                  </Box>
                </InlineStack>
              </Card>
              <Card padding="400">
                <BlockStack gap="800">
                  <BlockStack gap="200">
                    <SkeletonBodyText lines={1} />
                    <SkeletonDisplayText maxWidth="100%" />
                  </BlockStack>
                  <BlockStack gap="200">
                    <SkeletonBodyText />
                    <SkeletonDisplayText size="small" />
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card padding="400">
                <BlockStack gap="800">
                  <BlockStack gap="200">
                    <SkeletonBodyText lines={1} />
                    <SkeletonDisplayText maxWidth="100%" />
                  </BlockStack>
                  <BlockStack gap="200">
                    <SkeletonBodyText lines={1} />
                    <SkeletonDisplayText maxWidth="100%" />
                  </BlockStack>
                  <BlockStack gap="200">
                    <SkeletonBodyText />
                    <SkeletonDisplayText size="small" />
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </SkeletonPage>
  )
}
