import { createRoot } from 'react-dom/client'
import Widget from './components/Widget'
import { APP_BLOCK_ATTRIBUTE, APP_NAME_HANDLE, WIDGET_ID_ATTRIBUTE } from '../shared/utils/constants'
import { getWidgetSettingsForProductPage } from './utils/offers'

const getWidgetSettingsForRender = (widgetId) => {
  try {
    if (window[APP_NAME_HANDLE]?.[widgetId]) {
      const blockSettings = window[APP_NAME_HANDLE][widgetId]
      const widgetSettings = { ...blockSettings }

      const normalizedWidgetSettings = getWidgetSettingsForProductPage(widgetSettings)
      // const isOfferStatusActive = normalizedWidgetSettings?.offer?.status === STATUS_TYPES.ACTIVE
      const isThemeInThemeEditor = window?.Shopify?.designMode

      return { normalizedWidgetSettings, isThemeInThemeEditor, isOfferStatusActive: true }
    }
  } catch (error) {
    console.error('Failed to get widget settings:', error)
  }
}

const renderWidget = (wrapper, widgetSettingsForRender) => {
  try {
    if (!wrapper || !widgetSettingsForRender) return

    const { normalizedWidgetSettings } = widgetSettingsForRender

    const root = createRoot(wrapper)
    // if (isOfferStatusActive) {
    root.render(<Widget widgetSettings={normalizedWidgetSettings} />)
    // } else if (!normalizedWidgetSettings && isThemeInThemeEditor) {
    //   // root.render(<WidgetSkeleton />)
    // }
  } catch (error) {
    console.error('Failed to render widget:', error)
  }
}

const handleAppBlock = (widgetId, widgetWrapperElementAppBlockCurrent) => {
  const wrapper = widgetWrapperElementAppBlockCurrent
  wrapper.setAttribute(WIDGET_ID_ATTRIBUTE, widgetId)

  const widgetSettingsForRender = getWidgetSettingsForRender(widgetId)
  renderWidget(wrapper, widgetSettingsForRender)
}

const initializeWidget = async () => {
  const widgetId = document.currentScript?.getAttribute(WIDGET_ID_ATTRIBUTE)

  console.log('on load', `#${widgetId}.${APP_NAME_HANDLE}.${APP_BLOCK_ATTRIBUTE}`)
  if (!widgetId) return

  const widgetWrapperElementAppBlockCurrent = document.querySelector(
    `#${widgetId}.${APP_NAME_HANDLE}.${APP_BLOCK_ATTRIBUTE}`
  )

  handleAppBlock(widgetId, widgetWrapperElementAppBlockCurrent)
}

initializeWidget().catch(console.error)
