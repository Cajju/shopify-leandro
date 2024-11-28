import { Box, Text, Image, BlockStack } from '@shopify/polaris'
import { $Wrap } from './BundleType.styled'

const BundleType = ({ title, mainContent, secondaryContent, imgSrc, isPressed, onBundleClick }) => {
  return (
    <$Wrap $pressed={isPressed} onClick={onBundleClick}>
      <Box padding="400">
        <BlockStack gap="150">
          <Text as="h2" variant="headingMd" alignment="center">
            {title}
          </Text>
          <Image source={imgSrc} width="100%" />
          <Text>{mainContent}</Text>
          <Text tone="subdued">{secondaryContent}</Text>
        </BlockStack>
      </Box>
    </$Wrap>
  )
}

export default BundleType
