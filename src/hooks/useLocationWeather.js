import { useState, useEffect, useCallback } from 'react'
import { getCurrentWeather } from '../utils/openMeteoApi'

/**
 * Custom hook to fetch real-time weather data for a selected location
 * @param {Object} location - Location object with lat, lng properties
 * @returns {Object} - {weather, loading, error, refetch}
 */
export function useLocationWeather(location) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async () => {
    if (!location || !location.lat || !location.lng) {
      setWeather(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getCurrentWeather(location.lat, location.lng)
      
      // Transform to clean object format
      const cleanWeather = {
        temp: data.current.temperature ?? null,
        RH: data.current.humidity ?? null,
        wind: data.current.windSpeed ?? null,
        rain: 0, // Current API doesn't provide rain in current, using 0 as default
        weatherCode: data.current.weatherCode,
        timestamp: data.current.time,
        units: {
          temp: '°C',
          RH: '%',
          wind: 'km/h',
          rain: 'mm'
        },
        location: {
          lat: location.lat,
          lng: location.lng,
          x: location.x,
          y: location.y
        },
        raw: data // Keep full data for advanced usage
      }

      setWeather(cleanWeather)
      setLoading(false)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err.message || 'Failed to fetch weather data')
      setWeather(null)
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const refetch = useCallback(() => {
    fetchWeather()
  }, [fetchWeather])

  return {
    weather,
    loading,
    error,
    refetch
  }
}

/**
 * Custom hook for batch weather fetching (multiple locations)
 * @param {Array} locations - Array of location objects
 * @returns {Object} - {weatherData, loading, error, refetch}
 */
export function useBatchWeather(locations) {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBatchWeather = useCallback(async () => {
    if (!locations || locations.length === 0) {
      setWeatherData([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const promises = locations.map(loc => 
        getCurrentWeather(loc.lat, loc.lng)
          .then(data => ({
            location: loc,
            weather: {
              temp: data.current.temperature,
              RH: data.current.humidity,
              wind: data.current.windSpeed,
              rain: 0,
              weatherCode: data.current.weatherCode
            }
          }))
          .catch(err => ({
            location: loc,
            error: err.message
          }))
      )

      const results = await Promise.all(promises)
      setWeatherData(results)
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Failed to fetch batch weather data')
      setLoading(false)
    }
  }, [locations])

  useEffect(() => {
    fetchBatchWeather()
  }, [fetchBatchWeather])

  return {
    weatherData,
    loading,
    error,
    refetch: fetchBatchWeather
  }
}
