import styled from 'styled-components'

export const $Wrap = styled.div`
  border: #eee solid 1px;
  cursor: pointer;
  border-radius: 0.6rem;
  ${({ $pressed }) =>
    $pressed &&
    `
          border: solid 2px;
      `}
  &:hover {
    background-color: #eee;
  }
`
