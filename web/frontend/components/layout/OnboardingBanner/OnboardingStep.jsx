import { Link, Box, InlineStack } from '@shopify/polaris'
import { $Number } from './OnboardingStep.styled'

const OnboardingStep = ({ number, title, onClick, isCompleted }) => {
  const NUMBER_COLOR_COMPLETED = '#0C710F'

  return (
    <InlineStack gap="100" blockAlign="center">
      <$Number $color={NUMBER_COLOR_COMPLETED} $isFull={isCompleted}>
        {number}
      </$Number>
      <Box color={isCompleted ? 'text-success-secondary' : 'text-emphasis'}>
        <Link removeUnderline={isCompleted} onClick={onClick}>
          {title}
        </Link>
      </Box>
    </InlineStack>
  )
}

export default OnboardingStep
