import styled from 'styled-components'
import { withClassName } from '../../shared/utils/styled-components'

export const $WidgetContainer = withClassName(styled.div`
  font-family: sans-serif;
  font-family: inherit;
  color: ${(props) => props.$textColor};
  border-radius: 5px;
  margin: 1em 0;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    letter-spacing: normal;
  }
`)
