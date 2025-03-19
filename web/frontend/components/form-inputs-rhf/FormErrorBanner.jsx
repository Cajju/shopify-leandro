import { Banner, Text, List } from '@shopify/polaris'

const FormErrorBanner = ({ errors = {}, tone = 'critical' }) => {
  // Recursive function to extract all error messages from nested objects
  const extractErrorMessages = (obj) => {
    if (!obj) return []

    if (typeof obj === 'string') return [obj]

    if (obj.message) return [String(obj.message)]

    if (Array.isArray(obj)) {
      return obj.flatMap((item) => extractErrorMessages(item))
    }

    if (typeof obj === 'object') {
      return Object.values(obj).flatMap((value) => extractErrorMessages(value))
    }

    return [String(obj)]
  }

  // Flatten nested errors and extract messages, ensuring all items are strings
  const errorMessages = extractErrorMessages(errors).filter((message) => message !== 'undefined' && message !== 'null')

  return (
    errorMessages.length > 0 && (
      <Banner title="Form is not valid" tone={tone}>
        <List type="bullet">
          {errorMessages.map((message, index) => (
            <List.Item key={index}>
              <Text variant="bodyMd">{message}</Text>
            </List.Item>
          ))}
        </List>
      </Banner>
    )
  )
}

export default FormErrorBanner
