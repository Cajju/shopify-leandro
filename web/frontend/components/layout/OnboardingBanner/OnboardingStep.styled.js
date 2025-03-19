import styled from 'styled-components'

export const $Number = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $color, $isFull }) => ($isFull ? $color : 'transparent')};
  color: ${({ $isFull }) => ($isFull ? 'white' : 'black')};
  border: 1.5px solid ${({ $isFull }) => ($isFull ? 'transparent' : 'black')};
  font-weight: 400;
`
