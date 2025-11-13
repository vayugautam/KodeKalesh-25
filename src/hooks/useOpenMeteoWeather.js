import { useState, useEffect, useCallback } from 'react'
import { getCurrentWeather, getForecast, calculateFireRisk } from '../utils/openMeteoApi'

/**
 * Custom hook for fetching real-time weather data from Open-Meteo API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {boolean} enabled - Whether to fetch data
 * @returns {Object} Weather data and loading state
 */
export const useOpenMeteoWeather = (lat, lon, enabled = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async () => {
    if (!lat || !lon || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const weatherData = await getCurrentWeather(lat, lon)
      const riskAssessment = calculateFireRisk(weatherData)
      
      setData({
        ...weatherData,
        risk: riskAssessment,
      })
    } catch (err) {
      console.error('Error fetching weather:', err)
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }, [lat, lon, enabled])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  return {
    data,
    loading,
    error,
    refetch: fetchWeather,
  }
}

/**
 * Custom hook for fetching weather forecast
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of forecast days
 * @returns {Object} Forecast data and loading state
 */
export const useOpenMeteoForecast = (lat, lon, days = 7) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchForecast = useCallback(async () => {
    if (!lat || !lon) return

    setLoading(true)
    setError(null)

    try {
      const forecastData = await getForecast(lat, lon, days)
      setData(forecastData)
    } catch (err) {
      console.error('Error fetching forecast:', err)
      setError(err.message || 'Failed to fetch forecast data')
    } finally {
      setLoading(false)
    }
  }, [lat, lon, days])

  useEffect(() => {
    fetchForecast()
  }, [fetchForecast])

  return {
    data,
    loading,
    error,
    refetch: fetchForecast,
  }
}

/**
 * Custom hook for fetching weather for multiple fire locations
 * @param {Array} locations - Array of fire locations with lat/lon
 * @returns {Object} Weather data for all locations
 */
export const useBulkWeather = (locations = []) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBulkWeather = useCallback(async () => {
    if (!locations || locations.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const promises = locations.map(loc => {
        const [lat, lon] = loc.position
        return getCurrentWeather(lat, lon)
          .then(weather => ({
            ...loc,
            weather,
            risk: calculateFireRisk(weather),
          }))
          .catch(err => ({
            ...loc,
            error: err.message,
          }))
      })

      const results = await Promise.all(promises)
      setData(results)
    } catch (err) {
      console.error('Error fetching bulk weather:', err)
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }, [locations])

  useEffect(() => {
    fetchBulkWeather()
  }, [fetchBulkWeather])

  return {
    data,
    loading,
    error,
    refetch: fetchBulkWeather,
  }
}

export default {
  useOpenMeteoWeather,
  useOpenMeteoForecast,
  useBulkWeather,
}
