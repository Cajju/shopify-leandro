import { useState } from 'react'
import BundleTier from './BundleTier'
import { $WidgetContainer, $Title, $AddToCartButton, $TiersWrapper } from './VolumeBundle.styled'

const VolumeWidget = ({ tiers, blockSettings, product, moneyFormat }) => {
  const [selectedTier, setSelectedTier] = useState(tiers[0].id)

  console.log('Inside Widget:', { tiers, blockSettings, product })

  return (
    <$WidgetContainer
      $bodyFont={blockSettings.body_font}
      $bodyFontSize={blockSettings.body_font_size}
      $backgroundColor={blockSettings.background_color}
      $textColor={blockSettings.text_color}
      $borderColor={blockSettings.border_color}>
      <$TiersWrapper>
        {tiers.map((tier) => (
          <BundleTier
            key={tier.id}
            tier={tier}
            isSelected={selectedTier === tier.id}
            onSelect={setSelectedTier}
            blockSettings={blockSettings}
            variants={product.variants}
            options={product.options}
            moneyFormat={moneyFormat}
          />
        ))}
      </$TiersWrapper>

      <$AddToCartButton
        $buttonBgColor={blockSettings.solid_button_background}
        $buttonTextColor={blockSettings.solid_button_label}>
        Add to cart
      </$AddToCartButton>
    </$WidgetContainer>
  )
}

export default VolumeWidget
