import styled from 'styled-components'

const WidgetContainer = styled.div`
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
`

const Title = styled.h1`
  font-size: 20px;
  color: #333;
`

const Description = styled.p`
  font-size: 16px;
  color: #666;
`
const WidgetSkeleton = () => {
  return (
    <WidgetContainer>
      <Title>Boxhead Bundles widget</Title>
      <Description>This is a placeholder for the Boxhead Bundles widget.</Description>
      {/* Add more elements and logic here as needed */}
    </WidgetContainer>
  )
}

export default WidgetSkeleton
