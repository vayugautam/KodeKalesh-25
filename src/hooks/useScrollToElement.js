import { useCallback } from 'react'

/**
 * Custom hook for smooth scrolling to elements with offset for fixed header
 * @param {number} offset - Offset in pixels (default: 80px for header)
 * @returns {object} - Scroll utility functions
 */
export const useScrollToElement = (offset = 80) => {
  const scrollToRef = useCallback((ref) => {
    if (!ref || !ref.current) return

    const element = ref.current
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }, [offset])

  const scrollToId = useCallback((id) => {
    const element = document.getElementById(id)
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }, [offset])

  const scrollToSelector = useCallback((selector) => {
    const element = document.querySelector(selector)
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }, [offset])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  return {
    scrollToRef,
    scrollToId,
    scrollToSelector,
    scrollToTop
  }
}

/**
 * Standalone helper function to scroll to a ref
 * @param {React.RefObject} ref - React ref object
 * @param {number} offset - Offset in pixels (default: 80px)
 */
export const scrollToRef = (ref, offset = 80) => {
  if (!ref || !ref.current) {
    console.warn('scrollToRef: Invalid ref provided')
    return
  }

  const element = ref.current
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  })
}

/**
 * Scroll to element by ID
 * @param {string} id - Element ID
 * @param {number} offset - Offset in pixels (default: 80px)
 */
export const scrollToId = (id, offset = 80) => {
  const element = document.getElementById(id)
  if (!element) {
    console.warn(`scrollToId: Element with id "${id}" not found`)
    return
  }

  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  })
}

/**
 * Scroll to element by selector
 * @param {string} selector - CSS selector
 * @param {number} offset - Offset in pixels (default: 80px)
 */
export const scrollToSelector = (selector, offset = 80) => {
  const element = document.querySelector(selector)
  if (!element) {
    console.warn(`scrollToSelector: Element with selector "${selector}" not found`)
    return
  }

  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  })
}

/**
 * Scroll to top of page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

export default useScrollToElement
