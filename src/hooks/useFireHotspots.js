import { useState, useEffect } from 'react'
import { riskService } from '../utils/weatherApi'

/**
 * Custom hook to fetch fire hotspots
 * @param {boolean} enabled - Whether to fetch data
 */
export function useFireHotspots(enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const fetchHotspots = async () => {
      try {
        setLoading(true)
        setError(null)
        // This endpoint needs to be added to your backend
        const response = await riskService.getFireHotspots()
        setData(response)
      } catch (err) {
        setError(err.message || 'Failed to fetch fire hotspots')
        console.error('Fire hotspots fetch error:', err)
        // Use placeholder data on error
        setData(getPlaceholderHotspots())
      } finally {
        setLoading(false)
      }
    }

    fetchHotspots()
  }, [enabled])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await riskService.getFireHotspots()
      setData(response)
    } catch (err) {
      setError(err.message || 'Failed to fetch fire hotspots')
      setData(getPlaceholderHotspots())
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

// Placeholder fire hotspots data
function getPlaceholderHotspots() {
  return [
    { 
      id: 1, 
      position: [23.5937, 78.9629], 
      name: 'Fire Hotspot 1', 
      intensity: 'high',
      temperature: 45,
      detectedAt: '2 hours ago'
    },
    { 
      id: 2, 
      position: [26.8467, 80.9462], 
      name: 'Fire Hotspot 2', 
      intensity: 'medium',
      temperature: 38,
      detectedAt: '5 hours ago'
    },
    { 
      id: 3, 
      position: [21.1458, 79.0882], 
      name: 'Fire Hotspot 3', 
      intensity: 'high',
      temperature: 52,
      detectedAt: '1 hour ago'
    },
    { 
      id: 4, 
      position: [24.5854, 73.7125], 
      name: 'Fire Hotspot 4', 
      intensity: 'low',
      temperature: 32,
      detectedAt: '8 hours ago'
    },
  ]
}
