import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for smooth heatmap transitions
 * Interpolates between old and new heatmap data with crossfade animation
 * 
 * @param {Array} oldData - Previous heatmap data points
 * @param {Array} newData - New heatmap data points
 * @param {number} duration - Transition duration in milliseconds (default: 600ms)
 * @param {number} timelineValue - Timeline value for prediction
 * @returns {Object} - { currentData, isTransitioning, progress }
 */
export const useHeatmapTransition = (oldData, newData, duration = 600, timelineValue = 0) => {
  const [currentData, setCurrentData] = useState(newData)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const animationFrameRef = useRef(null)
  const startTimeRef = useRef(null)
  const previousDataRef = useRef(oldData)
  const previousTimelineRef = useRef(timelineValue)

  useEffect(() => {
    // Check if data or timeline changed
    const dataChanged = JSON.stringify(oldData) !== JSON.stringify(newData)
    const timelineChanged = previousTimelineRef.current !== timelineValue

    if (!dataChanged && !timelineChanged) {
      return
    }

    // Store previous data for interpolation
    previousDataRef.current = oldData
    previousTimelineRef.current = timelineValue
    
    setIsTransitioning(true)
    startTimeRef.current = null
    setProgress(0)

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      setProgress(currentProgress)

      // Easing function for smooth transition (ease-in-out)
      const easeInOutCubic = (t) => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }

      const easedProgress = easeInOutCubic(currentProgress)

      // Interpolate between old and new data
      const interpolatedData = interpolateHeatmapData(
        previousDataRef.current,
        newData,
        easedProgress,
        timelineValue
      )

      setCurrentData(interpolatedData)

      if (currentProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setIsTransitioning(false)
        setProgress(1)
        previousDataRef.current = newData
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [newData, oldData, duration, timelineValue])

  return {
    currentData,
    isTransitioning,
    progress
  }
}

/**
 * Interpolate between old and new heatmap data points
 * @param {Array} oldData - Previous data points
 * @param {Array} newData - New data points
 * @param {number} progress - Progress value (0 to 1)
 * @param {number} timelineValue - Timeline value for intensity adjustment
 * @returns {Array} - Interpolated data points
 */
const interpolateHeatmapData = (oldData, newData, progress, timelineValue = 0) => {
  if (!oldData || oldData.length === 0) return newData
  if (!newData || newData.length === 0) return oldData

  // Create a map of new data points by ID for quick lookup
  const newDataMap = new Map()
  newData.forEach(point => {
    const key = point.id || `${point.position[0]}_${point.position[1]}`
    newDataMap.set(key, point)
  })

  // Create interpolated points
  const interpolatedPoints = []

  // Timeline-based intensity multiplier
  const timelineMultiplier = 1 + (timelineValue / 6) * 0.15

  // Interpolate existing points that are in both datasets
  oldData.forEach(oldPoint => {
    const key = oldPoint.id || `${oldPoint.position[0]}_${oldPoint.position[1]}`
    const newPoint = newDataMap.get(key)

    if (newPoint) {
      // Point exists in both - interpolate intensity
      const oldIntensity = (oldPoint.riskScore || 0.5) * timelineMultiplier
      const newIntensity = (newPoint.riskScore || 0.5) * timelineMultiplier
      const interpolatedIntensity = oldIntensity + (newIntensity - oldIntensity) * progress

      interpolatedPoints.push({
        ...newPoint,
        position: newPoint.position,
        riskScore: interpolatedIntensity / timelineMultiplier, // Normalize back
        _interpolatedIntensity: interpolatedIntensity,
        _opacity: 1 // Full opacity for existing points
      })

      // Remove from map so we know what's left
      newDataMap.delete(key)
    } else {
      // Point is being removed - fade out
      const fadeOutOpacity = 1 - progress
      if (fadeOutOpacity > 0.1) {
        interpolatedPoints.push({
          ...oldPoint,
          _interpolatedIntensity: (oldPoint.riskScore || 0.5) * timelineMultiplier * fadeOutOpacity,
          _opacity: fadeOutOpacity
        })
      }
    }
  })

  // Add new points that weren't in old data - fade in
  newDataMap.forEach(newPoint => {
    const fadeInOpacity = progress
    if (fadeInOpacity > 0.1) {
      interpolatedPoints.push({
        ...newPoint,
        _interpolatedIntensity: (newPoint.riskScore || 0.5) * timelineMultiplier * fadeInOpacity,
        _opacity: fadeInOpacity
      })
    }
  })

  return interpolatedPoints
}

/**
 * Hook for smooth intensity interpolation only (simpler version)
 * @param {number} oldValue - Previous intensity value
 * @param {number} newValue - New intensity value
 * @param {number} duration - Transition duration in ms
 * @returns {number} - Interpolated intensity value
 */
export const useIntensityTransition = (oldValue, newValue, duration = 600) => {
  const [currentValue, setCurrentValue] = useState(newValue)
  const animationFrameRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (oldValue === newValue) {
      setCurrentValue(newValue)
      return
    }

    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-in-out
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const interpolated = oldValue + (newValue - oldValue) * easedProgress
      setCurrentValue(interpolated)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [oldValue, newValue, duration])

  return currentValue
}

export default useHeatmapTransition
