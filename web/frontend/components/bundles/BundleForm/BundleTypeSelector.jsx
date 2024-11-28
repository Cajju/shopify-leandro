import { Card, BlockStack, Text, Grid } from '@shopify/polaris'
import BundleType from './BundleType'
import { BUNDLE_TYPE_LABELS, BUNDLE_TYPES } from '@shared/utils/bundles/bundles-constants'

const bundleTypes = [
  {
    id: BUNDLE_TYPES.VOLUME,
    title: BUNDLE_TYPE_LABELS[BUNDLE_TYPES.VOLUME],
    imgSrc: 'https://cdn-icons-png.flaticon.com/512/6150/6150436.png',
    mainContent: 'Apply a discount when customers buy more of the same product.',
    secondaryContent: 'Example: buy 2 eyeshadows to get a discount.'
  },
  {
    id: BUNDLE_TYPES.MIX_AND_MATCH,
    title: BUNDLE_TYPE_LABELS[BUNDLE_TYPES.MIX_AND_MATCH],
    imgSrc: 'https://static.thenounproject.com/png/1358515-200.png',
    mainContent: 'Apply a discount when customers buy a pre-defined set of products.',
    secondaryContent: 'Example: buy an eyeshadow and an eyeliner to get a discount.'
  },
  {
    id: BUNDLE_TYPES.BUILD_BUNDLE,
    title: BUNDLE_TYPE_LABELS[BUNDLE_TYPES.BUILD_BUNDLE],
    imgSrc:
      'https://img.freepik.com/premium-vector/shop-icon-magic-box-outline-icon-linear-style-sign-mobile_397674-2028.jpg',
    mainContent: 'Customers choose which products are added to their bundle.',
    secondaryContent: 'Example: add any 2 eyeshadows and 2 eyeliners to get a discount.'
  }
]

export default function BundleTypeSelector({ selectedType, onTypeSelect }) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">
          Bundle type
        </Text>
        <Text as="h3">Select a bundle type below</Text>

        <Grid columns={{ xs: 1, sm: 3, md: 3, lg: 3, xl: 3 }}>
          {bundleTypes.map((params) => (
            <BundleType
              key={params.title}
              {...params}
              isPressed={params.id === selectedType}
              onBundleClick={() => onTypeSelect(params.id)}
            />
          ))}
        </Grid>
      </BlockStack>
    </Card>
  )
}
