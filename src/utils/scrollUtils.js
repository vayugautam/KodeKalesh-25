/**
 * Scroll Utilities - Export all scroll-related helpers
 * These can be imported and used throughout the application
 */

export { 
  useScrollToElement as default,
  scrollToRef,
  scrollToId,
  scrollToSelector,
  scrollToTop
} from '../hooks/useScrollToElement'

// Re-export for convenience
export { useScrollToElement } from '../hooks/useScrollToElement'
