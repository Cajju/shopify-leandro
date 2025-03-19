import { useAppBridge } from '@shopify/app-bridge-react'
import { Badge, Banner, Button, FormLayout, InlineStack, Page, Text, TextField } from '@shopify/polaris'
import { ExitIcon, XIcon } from '@shopify/polaris-icons'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import api from '../../rq-api/api'

// to show admin mode please run the command in chrome dev tools:
// window.frames[0].postMessage('toggleAdminMode', '*')
const ADMIN_SHOP_DOMAINS = ['leadhive-prd.myshopify.com', 'leadhive-stg.myshopify.com', 'leadhive-dev.myshopify.com']

const cleanDomain = (domain) => {
  return domain.replace('.myshopify.com', '')
}

const addSuffix = (domain) => {
  return domain + '.myshopify.com'
}

const AdminControlBanner = () => {
  const queryClient = useQueryClient()

  const shopify = useAppBridge()
  const [isAdminMode, setIsAdminMode] = useState(localStorage.getItem('isAdminMode') === 'true')

  function toggleAdminMode() {
    const newValue = !isAdminMode
    console.log('Toggling admin mode:', { current: isAdminMode, new: newValue })
    localStorage.setItem('isAdminMode', newValue)
    setIsAdminMode(newValue)
  }

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'toggleAdminMode') {
        toggleAdminMode()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isAdminMode])

  useEffect(() => {
    if (window.location.hash === '#admin') {
      toggleAdminMode()
      window.location.hash = ''
    }
  }, [])

  const isAdminShop = ADMIN_SHOP_DOMAINS.includes(shopify.config.shop)
  const shopOrigin = shopify.config.shop
  const [shopDomainToControl, setShopDomainToControl] = useState(() => {
    const savedDomain = localStorage.getItem('shopDomainToControl')
    return savedDomain ? cleanDomain(savedDomain) : cleanDomain(shopOrigin)
  })
  const isShopDomainChanged = cleanDomain(shopOrigin) !== shopDomainToControl

  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState(null)

  const handleShopDomainChange = (shopDomain) => {
    const cleanedDomain = cleanDomain(shopDomain)
    setShopDomainToControl(cleanedDomain)
  }

  const handleSave = async () => {
    setIsEditing(false)
    if (shopDomainToControl === cleanDomain(shopOrigin)) {
      return
    }
    localStorage.setItem('shopDomainToControl', addSuffix(shopDomainToControl))

    try {
      const res = await api.get(`/shop`)
      setError(null)
      console.log('res', res)
      // return res.data
    } catch (error) {
      // console.error('Error fetching shop data:', error)
      setError('Shop not exist')
    }
    queryClient.invalidateQueries()
  }

  const handleReset = () => {
    setIsEditing(false)
    setShopDomainToControl(cleanDomain(shopOrigin))
    localStorage.removeItem('shopDomainToControl')
    queryClient.invalidateQueries()
    setError(null)
  }

  return (
    <>
      <div style={{ display: 'none' }} id="admin-banner-mounted">
        AdminBanner is mounted
      </div>
      {isAdminShop && isAdminMode && (
        <Banner
          title={
            <InlineStack align="start" gap="200">
              <Text as="span" variant="headingSm" fontWeight={isShopDomainChanged ? 'bold' : 'regular'}>
                Admin panel
              </Text>{' '}
              {!isShopDomainChanged && !isEditing && (
                <Button size="micro" variant="primary" onClick={() => setIsEditing(true)}>
                  Connect to client store
                </Button>
              )}
            </InlineStack>
          }
          tone={isShopDomainChanged ? 'warning' : 'info'}>
          {!isEditing && (
            <InlineStack align="start" gap="200">
              <Text as="span" variant="headingSm" fontWeight={isShopDomainChanged ? 'bold' : 'regular'}>
                {isShopDomainChanged && 'You are in admin mode: controlling the shop'}
              </Text>
              {isShopDomainChanged && (
                <Badge size="large" tone="attention">
                  <Text as="span" variant="headingSm" fontWeight="bold">
                    {addSuffix(shopDomainToControl)}
                  </Text>
                </Badge>
              )}

              {isShopDomainChanged && (
                <Button icon={ExitIcon} size="micro" tone="critical" variant="secondary" onClick={handleReset}>
                  Logout
                </Button>
              )}
            </InlineStack>
          )}
          {isEditing && (
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  value={cleanDomain(shopDomainToControl)}
                  onChange={handleShopDomainChange}
                  helpText="Change the shop domain to the one you want to control"
                  suffix=".myshopify.com"
                  selectTextOnFocus
                  connectedRight={
                    <InlineStack gap="100">
                      <Button icon={XIcon} onClick={handleReset} tone="critical"></Button>

                      <Button onClick={handleSave}>Connect</Button>
                    </InlineStack>
                  }
                  error={error}
                />{' '}
              </FormLayout.Group>
            </FormLayout>
          )}
          <Text tone="caution">This banner is visible only to you</Text>
        </Banner>
      )}
    </>
  )
}

export default AdminControlBanner
