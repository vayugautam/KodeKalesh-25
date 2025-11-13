import { useState, useEffect } from 'react'
import { locationService } from '../utils/weatherApi'

/**
 * Custom hook to fetch all locations
 */
export function useLocations(enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const fetchLocations = async () => {
      try {
        setLoading(true)
        setError(null)
        const locationsData = await locationService.getAllLocations()
        setData(locationsData)
      } catch (err) {
        setError(err.message || 'Failed to fetch locations')
        console.error('Locations fetch error:', err)
        // Use placeholder data on error
        setData(getPlaceholderLocations())
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [enabled])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const locationsData = await locationService.getAllLocations()
      setData(locationsData)
    } catch (err) {
      setError(err.message || 'Failed to fetch locations')
      setData(getPlaceholderLocations())
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * Custom hook to search locations
 */
export function useLocationSearch(query, enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !query || query.length < 2) {
      setData(null)
      return
    }

    const searchLocations = async () => {
      try {
        setLoading(true)
        setError(null)
        const results = await locationService.searchLocations(query)
        setData(results)
      } catch (err) {
        setError(err.message || 'Failed to search locations')
        console.error('Location search error:', err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchLocations, 300)
    return () => clearTimeout(timeoutId)
  }, [query, enabled])

  return { data, loading, error }
}

// Placeholder data fallback
function getPlaceholderLocations() {
  return [
    { 
      id: 1, 
      name: 'New Delhi', 
      region: 'North',
      lat: 28.6139,
      lon: 77.2090,
      status: 'active',
      riskLevel: 'low'
    },
    { 
      id: 2, 
      name: 'Mumbai', 
      region: 'West',
      lat: 19.0760,
      lon: 72.8777,
      status: 'active',
      riskLevel: 'medium'
    },
    { 
      id: 3, 
      name: 'Bangalore', 
      region: 'South',
      lat: 12.9716,
      lon: 77.5946,
      status: 'inactive',
      riskLevel: 'low'
    },
    { 
      id: 4, 
      name: 'Kolkata', 
      region: 'East',
      lat: 22.5726,
      lon: 88.3639,
      status: 'active',
      riskLevel: 'high'
    },
    { 
      id: 5, 
      name: 'Chennai', 
      region: 'South',
      lat: 13.0827,
      lon: 80.2707,
      status: 'active',
      riskLevel: 'medium'
    },
  ]
}
