import { widgetClsName } from './constants'
import { forwardRef } from 'react'

// HOC to automatically handle className with displayName
export const withClassName = (WrappedComponent) => {
  const WithClassName = forwardRef((props, ref) => {
    const className = widgetClsName(
      WrappedComponent.displayName
        .replace(/\$/g, '') // Remove dollar signs
        .replace(/([A-Z])/g, '-$1') // Add hyphens before capitals
        .toLowerCase() // Convert to lowercase
        .replace(/^-/, '') // Remove leading hyphen if exists
    )
    return <WrappedComponent {...props} className={className} ref={ref} />
  })
  return WithClassName
}
