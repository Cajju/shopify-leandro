import { Card, FormLayout, Text, Button, BlockStack, Box, InlineError } from '@shopify/polaris'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Select, TextField, Checkbox } from '@components/form-inputs-rhf'
import BundleTier from './BundleTier'
import AddProducts from './AddProducts'
import { useEffect, useState } from 'react'
import useProducts from '@rq-api/shop/useProducts'
import { defaultValuesTier } from '@shared/utils/bundles/bundles-constants'
import useShop from '../../../rq-api/shop/useShop'

export default function VolumeDiscount() {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, defaultValues }
  } = useFormContext()
  const { data: shop } = useShop()
  const { fields, append, remove } = useFieldArray({ name: 'tiers', control })
  const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: productsPage,
    isLoading,
    error
  } = useProducts({
    searchQuery,
    page: 1,
    limit: 10
  })
  const { products, totalCount: totalProductsCount } = productsPage || {}

  const preSelectedTierOptions = watch('tiers').map((_, index) => ({
    label: `Tier #${index + 1}`,
    value: String(index)
  }))

  const onSearchQueryChange = (query) => {
    setSearchQuery(query)
  }

  const handleProductsSelect = (selectedProducts) => {
    setValue('products', selectedProducts)
    setIsAddProductsModalOpen(false)
  }

  const removeProduct = (productId) => {
    const updatedProductIds = getValues('products').filter((product) => product.id !== productId)
    setValue('products', updatedProductIds)
  }

  useEffect(() => {
    console.log('products ', watch('products'))
    console.log('errors ', errors.products)
  }, [watch('products')])

  const money_format = shop?.shopInformation.money_format || '${{amount}}'

  return (
    <>
      {/* Bundle Name */}
      <Card>
        <FormLayout>
          <TextField
            control={control}
            name="txtBundleName"
            label="Bundle name"
            helpText="Customers will see this name in checkout."
          />

          <Text as="h5" variant="headingSm">
            Bundle products
          </Text>
          <Text>Select products which will be included in this bundle.</Text>

          <AddProducts
            open={isAddProductsModalOpen}
            onClose={() => setIsAddProductsModalOpen(false)}
            onSubmit={handleProductsSelect}
            onSearchQueryChange={onSearchQueryChange}
            products={products}
            totalCount={totalProductsCount}
            isLoading={isLoading}
            initialSelectedProducts={defaultValues.products}
            onRemoveProduct={removeProduct}
          />
          <Button variant="secondary" onClick={() => setIsAddProductsModalOpen(true)}>
            Add products
          </Button>

          {errors.products && <InlineError message={errors.products.message} fieldID="products" />}
        </FormLayout>
      </Card>

      {/* Discounts: bundle tiers */}
      <Card>
        <BlockStack gap="300">
          <Text as="h5" variant="headingSm">
            Discounts
          </Text>
          {fields.map((field, index) => (
            <BundleTier
              key={field.id}
              index={index}
              removeTier={remove}
              currFieldPrefix={`tiers.${index}`}
              currency={money_format.replace('{{amount}}', '')}
            />
          ))}

          <Box>
            <Button onClick={() => append(defaultValuesTier)}>Add discount tier</Button>
          </Box>
        </BlockStack>
      </Card>

      {/* Settings */}
      <Card>
        <FormLayout>
          <Text as="h5" variant="headingSm">
            Settings
          </Text>

          <Select
            control={control}
            name="settings.preSelectedTier"
            label="Pre-selected tier"
            options={preSelectedTierOptions}
          />
          <BlockStack>
            <Checkbox control={control} name="settings.isSingleVariant" label="Single variant picker" />
            <Text variant="subdued">Apply the same variant to all product units.</Text>
          </BlockStack>
          <Checkbox control={control} name="settings.showPricePerUnit" label="Show price per unit" />
          <TextField control={control} name="settings.txtAddToCart" label="Button text" />
        </FormLayout>
      </Card>
    </>
  )
}
