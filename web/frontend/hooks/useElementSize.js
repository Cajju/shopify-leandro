import { useEffect, useRef, useState } from 'react'

export const useElementSize = () => {
  const elementRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const updateDimensions = () => {
      if (elementRef.current) {
        setWidth(elementRef.current.offsetWidth)
        setHeight(elementRef.current.offsetHeight)
      }
    }

    // Initial measurement
    updateDimensions()

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(updateDimensions)

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current)
    }

    // Cleanup
    return () => {
      if (elementRef.current) {
        resizeObserver.unobserve(elementRef.current)
      }
    }
  }, [elementRef])

  return { width, height, elementRef }
}
