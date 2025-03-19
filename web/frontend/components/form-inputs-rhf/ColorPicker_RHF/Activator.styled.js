import styled from 'styled-components'

export const $ActivatorWrap = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid #c4cdd5;
  border-radius: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

export const $Activator = styled.div`
  width: 30px;
  height: 30px;
  border: 1px solid #f0f0f0;
  border-radius: 7px;
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${({ $selectedColor }) => $selectedColor};
`
