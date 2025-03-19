import styled from 'styled-components'

export const $ColorPaletteWrapper = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1em;
`

export const $PrefixWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const $PrefixColorThumbnail = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${({ $color }) => $color};
  border-radius: 40px;
  border: 1px solid #ddd;
`

export const $PrefixText = styled.span`
  margin-left: 4px;
`

export const $RecommendedColorsWrapper = styled.div`
  display: flex;
  gap: 0.1em;

  flex-direction: column;
  justify-items: start;
  border-top: 1px solid #ddd;
  padding-top: 1em;
  width: 100%;
`

export const $RecommendedColorsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  max-width: 232px;
`

export const $ColorCircle = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: border 0.1s;

  &:hover {
    border: 1.5px solid #6c6c6c;
  }
`
