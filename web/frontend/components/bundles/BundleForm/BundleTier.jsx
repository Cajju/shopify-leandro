import { BlockStack, Box, Button, Divider, FormLayout, InlineStack, Text } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons'
import { useFormContext } from 'react-hook-form'
import { Checkbox, ChoiceList, TextField } from '../../form-inputs-rhf'
import { BUNDLE_VOLUME_DISCOUNT_TYPES, BUNDLE_VOLUME_QUANTITY_TYPES } from '@shared/utils/bundles/bundles-constants'

const BundleTier = ({ index = 0, removeTier, currFieldPrefix, currency }) => {
  const { control, watch } = useFormContext()

  return (
    <>
      <Box padding="300" borderRadius="100" borderWidth="025" borderColor="border-tertiary">
        <FormLayout>
          <InlineStack align="space-between">
            <Text tone="subdued">Tier #{index + 1}</Text>
            {index >= 1 && <Button icon={DeleteIcon} variant="tertiary" onClick={() => removeTier(index)} />}
          </InlineStack>
          <FormLayout.Group condensed>
            <ChoiceList
              name={`${currFieldPrefix}.quantity.type`}
              {...{ control }}
              title="Quantity"
              choices={[
                {
                  label: 'Fixed amount',
                  value: BUNDLE_VOLUME_QUANTITY_TYPES.FIXED_AMOUNT,
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <>
                        <BlockStack gap="100">
                          <Text tone="subdued">Customers must add this exact amount of products.</Text>
                          <TextField
                            {...{ control }}
                            name={`${currFieldPrefix}.quantity.fixedAmount`}
                            type="number"
                            min={1}
                            // defaultValue={1}
                          />
                        </BlockStack>
                      </>
                    )
                },
                {
                  label: 'Range',
                  value: BUNDLE_VOLUME_QUANTITY_TYPES.RANGE,
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <>
                        <BlockStack gap="100">
                          <Text tone="subdued">Customers must add a number of products within this range.</Text>

                          <FormLayout.Group condensed>
                            <TextField
                              {...{ control }}
                              name={`${currFieldPrefix}.quantity.range.min`}
                              type="number"
                              min={1}
                              label="Minimum"
                              // defaultValue={1}
                            />
                            <TextField
                              {...{ control }}
                              name={`${currFieldPrefix}.quantity.range.max`}
                              type="number"
                              label="Maximum"
                              // defaultValue={2}
                            />
                          </FormLayout.Group>
                        </BlockStack>
                      </>
                    )
                },
                {
                  label: 'Minimum amount',
                  value: BUNDLE_VOLUME_QUANTITY_TYPES.MIN_AMOUNT,
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <>
                        <BlockStack gap="100">
                          <Text tone="subdued">
                            The discount will be applied when your customer buys the amount or more. Example: if your
                            tier is buy 5 for 10% off, the 6th product will be discounted as well.
                          </Text>
                          <TextField
                            {...{ control }}
                            name={`${currFieldPrefix}.quantity.minAmount`}
                            type="number"
                            min={1}
                            label="Minimum"
                            // defaultValue={1}
                          />
                        </BlockStack>
                      </>
                    )
                }
              ]}
            />

            <ChoiceList
              {...{ control }}
              name={`${currFieldPrefix}.discount.type`}
              title="Discount"
              choices={[
                {
                  label: 'Price off',
                  value: BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF,
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <Box maxWidth="8rem">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <TextField
                            {...{ control }}
                            name={`${currFieldPrefix}.discount.priceOff`}
                            prefix={currency}
                            size="slim"
                            type="number"
                            // defaultValue={10}
                          />
                          <Text>Off</Text>
                        </div>
                      </Box>
                    )
                },
                {
                  label: 'Percentage off',
                  value: BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF,
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <Box maxWidth="8rem">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <TextField
                            {...{ control }}
                            name={`${currFieldPrefix}.discount.percentageOff`}
                            suffix="%"
                            size="slim"
                            // defaultValue={10}
                          />
                          <Text>Off</Text>
                        </div>
                      </Box>
                    )
                },
                {
                  label: 'Fixed price',
                  value: BUNDLE_VOLUME_DISCOUNT_TYPES.FIXED_PRICE,
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <Box>
                        <Box maxWidth="8rem">
                          <TextField
                            {...{ control }}
                            name={`${currFieldPrefix}.discount.fixedPrice`}
                            prefix="$"
                            size="slim"
                            placeholder="0.00"
                          />
                        </Box>
                        <Text tone="subdued">
                          Please note the fixed price must be lower than the products none discounted price.
                        </Text>
                      </Box>
                    )
                },
                {
                  label: 'No discount',
                  value: BUNDLE_VOLUME_DISCOUNT_TYPES.NO_DISCOUNT
                }
              ]}
            />
          </FormLayout.Group>
          <Divider />
          <TextField label="Tier text" {...{ control }} name={`${currFieldPrefix}.tierText`} />
          <Checkbox label="Add ribbon" {...{ control }} name={`${currFieldPrefix}.ribbon.show`} />
          {watch(`${currFieldPrefix}.ribbon.show`) && (
            <TextField {...{ control }} name={`${currFieldPrefix}.ribbon.text`} shouldUnregister label="Ribbon text" />
          )}
        </FormLayout>
      </Box>
    </>
  )
}

export default BundleTier
