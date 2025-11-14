import { useState, useEffect } from 'react'
import { riskService } from '../utils/weatherApi'

/**
 * Custom hook to fetch risk assessment data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {boolean} enabled - Whether to fetch data
 */
export function useRiskAssessment(lat, lon, enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !lat || !lon) {
      return
    }

    const fetchRiskAssessment = async () => {
      try {
        setLoading(true)
        setError(null)
        const riskData = await riskService.getRiskAssessment(lat, lon)
        setData(riskData)
      } catch (err) {
        setError(err.message || 'Failed to fetch risk assessment')
        console.error('Risk assessment fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiskAssessment()
  }, [lat, lon, enabled])

  const refetch = async () => {
    if (!lat || !lon) return
    
    try {
      setLoading(true)
      setError(null)
      const riskData = await riskService.getRiskAssessment(lat, lon)
      setData(riskData)
    } catch (err) {
      setError(err.message || 'Failed to fetch risk assessment')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * Custom hook to fetch risk alerts
 */
export function useRiskAlerts(region, enabled = true, refreshKey = 0) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const fetchRiskAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        const alertsData = await riskService.getRiskAlerts(region)
        setData(alertsData)
      } catch (err) {
        setError(err.message || 'Failed to fetch risk alerts')
        console.error('Risk alerts fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiskAlerts()
  }, [region, enabled, refreshKey])

  return { data, loading, error }
}

/**
 * Custom hook to fetch all risk zones
 */
export function useRiskZones(enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const fetchRiskZones = async () => {
      try {
        setLoading(true)
        setError(null)
        const zonesData = await riskService.getRiskZones()
        setData(zonesData)
      } catch (err) {
        setError(err.message || 'Failed to fetch risk zones')
        console.error('Risk zones fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiskZones()
  }, [enabled])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const zonesData = await riskService.getRiskZones()
      setData(zonesData)
    } catch (err) {
      setError(err.message || 'Failed to fetch risk zones')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * Custom hook to fetch risk statistics
 */
export function useRiskStatistics(enabled = true, refreshKey = 0) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const fetchStatistics = async () => {
      try {
        setLoading(true)
        setError(null)
        const statsData = await riskService.getRiskStatistics()
        setData(statsData)
      } catch (err) {
        setError(err.message || 'Failed to fetch risk statistics')
        console.error('Risk statistics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [enabled, refreshKey])

  return { data, loading, error }
}
