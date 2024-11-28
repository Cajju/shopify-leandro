import { createRoot } from 'react-dom/client'
import VolumeWidget from './components/VolumeBundle'
import { calculateRelevantOffer, normalizeOfferForRendering } from './utils/offers'
const { offers, blockSettings, product, widgetId, moneyFormat } = window.widgetVariables

const Widget = () => {
  console.log('Inside Widget:', window.widgetVariables)
  const relevantOffer = calculateRelevantOffer({ offers: offers.bundles, product })
  const normalizedOffer = normalizeOfferForRendering({ offer: relevantOffer, product })
  if (!normalizedOffer) {
    return null
  }

  return <VolumeWidget {...{ tiers: normalizedOffer.tiers, blockSettings, product, moneyFormat }} />
}

const root = createRoot(document.getElementById(widgetId))
root.render(<Widget />)
