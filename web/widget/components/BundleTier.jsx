import {
  $TierContainer,
  $OptionLabel,
  $RadioInput,
  $SaveBadge,
  $PriceInfo,
  $OriginalPrice,
  $DiscountedPrice,
  $OptionSelector,
  $Ribbon,
  $OrderedList,
  $TierTitle,
  $NumberContainer,
  $OptionSelectorWrapper,
  $Chevron,
  $SelectedPrefix,
  $ListItem
} from './BundleTier.styled'
import { getVariantsOptions } from '../utils/offers'
import { money } from '../utils/lib'

const BundleTier = ({ tier, isSelected, onSelect, blockSettings, variants, options, moneyFormat }) => {
  const isDefaultTitle = variants[0].title === 'Default Title' && variants.length === 1
  console.log('isDefaultTitle', isDefaultTitle)
  console.log('options', options)
  const variantsOptions = getVariantsOptions(variants, options)
  console.log('variantsOptions', variantsOptions)

  return (
    <div>
      <$TierContainer
        $borderColor={blockSettings.solid_button_background}
        $isSelected={isSelected}
        $selectedBackgroundColor={blockSettings.solid_button_background}
        $isRibbonExist={!!tier.ribbon}>
        <$TierTitle>
          <div>
            <$RadioInput
              type="radio"
              name="bundle-option"
              value={tier.id}
              checked={isSelected}
              onChange={() => onSelect(tier.id)}
              $borderColor={blockSettings.solid_button_background}
            />
            <span>{tier.title}</span>
          </div>

          <div>
            {!blockSettings.hide_save_banner && tier.savings > 0 && (
              <$SaveBadge $saveBadgeColor={blockSettings.solid_button_background}>
                SAVE {money(moneyFormat, tier.savings)}
              </$SaveBadge>
            )}
            <$PriceInfo>
              {tier.originalPrice !== tier.discountedPrice && (
                <$OriginalPrice $originalPriceColor={blockSettings.text_color}>
                  {money(moneyFormat, tier.originalPrice)}
                </$OriginalPrice>
              )}
              <$DiscountedPrice $discountedPriceColor={blockSettings.discounted_price_color}>
                {money(moneyFormat, tier.discountedPrice)}
              </$DiscountedPrice>
              {/* {blockSettings.price_display.price_per_unit && } */}
              {/* <$TotalPrice>Total</$TotalPrice> */}
            </$PriceInfo>
          </div>
        </$TierTitle>

        {!isDefaultTitle && isSelected && tier.quantity > 1 && (
          <$OrderedList>
            {Array.from({ length: tier.quantity }).map((_, index) => (
              <$ListItem key={index}>
                <$NumberContainer $borderColor={blockSettings.text_color}>
                  <span>{index + 1}</span>
                  <hr />
                </$NumberContainer>

                {Object.keys(variantsOptions).map((option) => {
                  return (
                    <div>
                      <$OptionLabel $textColor={blockSettings.text_color}>{option}</$OptionLabel>
                      <$OptionSelectorWrapper>
                        <$SelectedPrefix $textColor={blockSettings.text_color}>✓</$SelectedPrefix>
                        <$OptionSelector $borderColor={blockSettings.text_color} $textColor={blockSettings.text_color}>
                          {variantsOptions[option].map((optionValue) => (
                            <option key={optionValue} value={optionValue}>
                              {optionValue}
                            </option>
                          ))}
                        </$OptionSelector>
                        <$Chevron
                          $chevronColor={blockSettings.solid_button_background}
                          $textColor={blockSettings.text_color}>
                          {' '}
                        </$Chevron>
                      </$OptionSelectorWrapper>
                    </div>
                  )
                })}
              </$ListItem>
            ))}
          </$OrderedList>
        )}
      </$TierContainer>
      {tier.ribbon && (
        <$Ribbon
          $bgColor={blockSettings.solid_button_background}
          $textColor={blockSettings.solid_button_label}
          $isSelected={isSelected}>
          {tier.ribbon}
        </$Ribbon>
      )}
    </div>
  )
}

export default BundleTier
