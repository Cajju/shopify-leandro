import { Tooltip, Icon, InlineStack, Text } from '@shopify/polaris'
import { QuestionCircleIcon } from '@shopify/polaris-icons'

const TooltipHelpLabel = ({ helpText, label }) => {
  return (
    <InlineStack gap="100" blockAlign="center">
      <Text as="span" variant="bodySm">
        {label}
      </Text>
      <Tooltip content={helpText}>
        <Icon source={QuestionCircleIcon} />
      </Tooltip>
    </InlineStack>
  )
}

export default TooltipHelpLabel
