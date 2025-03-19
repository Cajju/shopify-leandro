import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  display: inline-block !important;
  margin-top: 3px;

  &:after {
    content: ' ';
    display: block !important;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: ${rotate} 1.2s linear infinite;
  }
`

const SpinnerOverlay = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
`

export const LoadingSpinner = ({ asOverlay }) => {
  return (
    <div>
      {asOverlay ? (
        <SpinnerOverlay>
          <Spinner />
        </SpinnerOverlay>
      ) : (
        <Spinner />
      )}
    </div>
  )
}
