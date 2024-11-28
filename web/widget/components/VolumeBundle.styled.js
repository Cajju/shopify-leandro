import styled from 'styled-components'

export const $WidgetContainer = styled.div`
  font-family: ${(props) =>
    `${props.$bodyFont?.family || 'inherit'}, ${props.$bodyFont?.fallback_families || 'inherit'}`};
  font-weight: ${(props) => props.$bodyFont?.weight || 'inherit'};
  font-style: ${(props) => props.$bodyFont?.style || 'inherit'};
  font-size: ${(props) => `${props.$bodyFontSize / 100}rem`};
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  border-radius: 5px;
  padding: 15px;
`

export const $Title = styled.h2`
  font-family: ${(props) =>
    `${props.$headingFont?.family || 'inherit'}, ${props.$headingFont?.fallback_families || 'inherit'}`};
  font-weight: ${(props) => props.$headingFont?.weight || 'inherit'};
  font-style: ${(props) => props.$headingFont?.style || 'inherit'};
  font-size: ${(props) => `${props.$headingFontSize / 100}em`};
  margin-bottom: 10px;
`

export const $TiersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625em;
`

export const $AddToCartButton = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  background-color: ${(props) => props.$buttonBgColor};
  color: ${(props) => props.$buttonTextColor};
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }
`
