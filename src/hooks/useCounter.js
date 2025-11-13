import { useState } from 'react'

/**
 * Custom hook for counter functionality
 * @param {number} initialValue - Initial count value
 * @returns {Object} Counter state and methods
 */
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(prev => prev + 1)
  const decrement = () => setCount(prev => prev - 1)
  const reset = () => setCount(initialValue)
  const setValue = (value) => setCount(value)

  return { count, increment, decrement, reset, setValue }
}
