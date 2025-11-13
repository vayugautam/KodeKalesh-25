import { useState, useEffect } from 'react'
import { weatherService } from '../utils/weatherApi'

/**
 * Custom hook to fetch current weather data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {boolean} enabled - Whether to fetch data
 */
export function useWeather(lat, lon, enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !lat || !lon) {
      return
    }

    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const weatherData = await weatherService.getCurrentWeather(lat, lon)
        setData(weatherData)
      } catch (err) {
        setError(err.message || 'Failed to fetch weather data')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [lat, lon, enabled])

  const refetch = async () => {
    if (!lat || !lon) return
    
    try {
      setLoading(true)
      setError(null)
      const weatherData = await weatherService.getCurrentWeather(lat, lon)
      setData(weatherData)
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * Custom hook to fetch weather forecast
 */
export function useForecast(lat, lon, days = 7, enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !lat || !lon) {
      return
    }

    const fetchForecast = async () => {
      try {
        setLoading(true)
        setError(null)
        const forecastData = await weatherService.getForecast(lat, lon, days)
        setData(forecastData)
      } catch (err) {
        setError(err.message || 'Failed to fetch forecast data')
        console.error('Forecast fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [lat, lon, days, enabled])

  return { data, loading, error }
}
