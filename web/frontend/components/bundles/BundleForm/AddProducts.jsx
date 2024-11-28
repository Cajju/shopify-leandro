import React, { useState, useEffect } from 'react'
import {
  Modal,
  TextField,
  ResourceList,
  Avatar,
  Text,
  Icon,
  Spinner,
  ResourceItem,
  InlineStack,
  Box,
  Button,
  Thumbnail
} from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons'
import { useDebounce } from 'use-debounce'

export default function AddProducts({
  open,
  onClose,
  onSubmit,
  products,
  totalCount,
  isLoading,
  onSearchQueryChange,
  initialSelectedProducts,
  onRemoveProduct
}) {
  const [selectedProducts, setSelectedProducts] = useState(initialSelectedProducts || [])
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue] = useDebounce(searchValue, 300)

  const getSelectedProductsIds = () => {
    return selectedProducts.map((product) => product.id)
  }

  useEffect(() => {
    onSearchQueryChange(debouncedSearchValue)
  }, [debouncedSearchValue, onSearchQueryChange])

  const handleSearchChange = (value) => {
    setSearchValue(value)
  }

  const handleSelectionChange = (selectedIds) => {
    const updatedSelectedProducts = products.filter((product) => selectedIds.includes(product.id))
    setSelectedProducts(updatedSelectedProducts)
  }

  const handleRemoveProduct = (productId) => {
    const updatedSelectedProducts = selectedProducts.filter((product) => product.id !== productId)
    setSelectedProducts(updatedSelectedProducts)
    onRemoveProduct(productId)
  }

  return (
    <>
      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <ResourceList
          items={selectedProducts}
          renderItem={({ id, title, image, variantsCount, price }) => (
            <ResourceItem
              id={id}
              media={<Thumbnail source={image || ''} alt={title} size="small" />}
              accessibilityLabel={`View details for ${title}`}>
              <InlineStack gap="300" align="space-between">
                <Box>
                  <Text variant="bodyMd" fontWeight="bold">
                    {title}
                  </Text>
                  <Text variant="bodySm" color="subdued">
                    {variantsCount} variants | ${price || '0.00'}
                  </Text>
                </Box>

                <Button variant="tertiary" onClick={() => handleRemoveProduct(id)}>
                  Remove
                </Button>
              </InlineStack>
            </ResourceItem>
          )}
        />
      )}

      <Modal
        open={open}
        onClose={onClose}
        title="Add products"
        primaryAction={{
          content: 'Select',
          onAction: () => onSubmit(selectedProducts)
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: onClose
          }
        ]}>
        <Modal.Section>
          <TextField
            prefix={<Icon source={SearchIcon} />}
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search"
            clearButton
            onClearButtonClick={() => {
              setSearchValue('')
              onSearchQueryChange('')
            }}
          />
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spinner accessibilityLabel="Loading products" size="large" />
            </div>
          ) : products && products.length > 0 ? (
            <ResourceList
              resourceName={{ singular: 'product', plural: 'products' }}
              showHeader={false}
              items={products}
              renderItem={(item) => {
                const { id, title, image, optionsCount, variantsCount } = item
                const media =
                  image && image.length > 0 ? (
                    <Avatar customer size="lg" source={image} />
                  ) : (
                    <Avatar customer size="lg" name={title} />
                  )
                const description = `${optionsCount} options • ${variantsCount} variants`

                return (
                  <ResourceList.Item id={id} media={media} accessibilityLabel={`Select ${title}`}>
                    <h3>
                      <Text fontWeight="bold">{title}</Text>
                    </h3>
                    <div>{description}</div>
                  </ResourceList.Item>
                )
              }}
              selectedItems={getSelectedProductsIds()}
              onSelectionChange={handleSelectionChange}
              selectable
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text>No products found</Text>
            </div>
          )}
        </Modal.Section>
        <Modal.Section>
          <Text tone="subdued">
            {selectedProducts.length} of {totalCount} products selected
          </Text>
        </Modal.Section>
      </Modal>
    </>
  )
}
