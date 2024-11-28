import styled from 'styled-components'
import { addOpacityToHex } from '../utils/lib'

export const $TierContainer = styled.div`
  border: 1px solid ${(props) => (props.$isSelected ? props.$borderColor : addOpacityToHex(props.$borderColor, 0.1))};
  border-radius: ${(props) => (props.$isRibbonExist ? '4px 4px 0 0' : '4px')};
  padding: 10px;
  background-color: ${(props) =>
    props.$isSelected ? addOpacityToHex(props.$selectedBackgroundColor, 0.1) : 'transparent'};
  position: relative;
`

export const $OrderedList = styled.ol`
  list-style-type: none;
  padding-left: 0;
  counter-reset: item;
  margin: 0;
`

export const $ListItem = styled.li`
  counter-increment: item;
  position: relative;
  display: flex;
  flex-direction: column;
`

export const $OptionLabel = styled.label`
  color: ${(props) => addOpacityToHex(props.$textColor, 0.5)};
`

export const $OptionSelectorWrapper = styled.div`
  position: relative;
  width: 100%;
`

export const $OptionSelector = styled.select`
  width: 100%;
  padding: 8px 30px 8px 30px; // Increased left padding for prefix
  border: 1px solid ${(props) => addOpacityToHex(props.$borderColor, 0.2)};
  border-radius: 5px;
  color: ${(props) => props.$textColor};
  background-color: transparent;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
`

export const $Chevron = styled.div`
  pointer-events: none;
  color: ${(props) => props.$chevronColor || props.$textColor};

  &::after {
    content: '>';
    font-size: 0.8em;
    transform: rotate(90deg) scaleY(2) translateY(0px) translateX(-100%);
    position: absolute;
    top: 50%;
    right: 0.8em;
  }
`

export const $SelectedPrefix = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${(props) => props.$textColor};
`

export const $NumberContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }

  hr {
    flex-grow: 1;
    border: none;
    height: 1px;
    background-color: ${(props) => addOpacityToHex(props.$borderColor, 0.1)};
    margin: 0;
  }
`

export const $TierTitle = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  justify-content: space-between;
  flex-wrap: wrap;

  & > div {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
`

export const $RadioInput = styled.input`
  margin-right: 10px;
  border-color: ${(props) => props.$borderColor};
  width: 20px;
  height: 20px;
  cursor: pointer;

  &:checked {
    accent-color: ${(props) => props.$borderColor};
  }

  /* Adjustments for better cross-browser compatibility */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 2px solid ${(props) => props.$borderColor};
  border-radius: 50%;
  outline: none;
  position: relative;

  &:checked::before {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background-color: ${(props) => props.$borderColor};
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`

export const $SaveBadge = styled.span`
  background-color: ${(props) => addOpacityToHex(props.$saveBadgeColor, 0.3)};
  color: ${(props) => props.$saveBadgeColor};
  padding: 2px 5px;
  border-radius: 100px;
  font-size: 0.8em;
  font-weight: 700;
  height: 100%;
  white-space: nowrap;
`

export const $PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
  font-size:.9em;
  line-height: 1.4em;
`

export const $OriginalPrice = styled.span`
  text-decoration: line-through;
  color: ${(props) => addOpacityToHex(props.$originalPriceColor, 0.5)};
`

export const $DiscountedPrice = styled.span`
  color: ${(props) => props.$discountedPriceColor};
`

export const $Ribbon = styled.div`
  text-align: center;
  color: ${(props) => (props.$isSelected ? props.$textColor : props.$bgColor)};
  background-color: ${(props) => (props.$isSelected ? props.$bgColor : addOpacityToHex(props.$bgColor, 0.1))};
  padding: 10px;
  border-radius: 0 0 4px 4px;
`
