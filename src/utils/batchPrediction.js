/**
 * Batch Prediction Utilities
 * Handles batch prediction for multiple grid cells
 */

import { convertXYToLatLon, getGridCellBounds, GRID_CONFIG } from './gridUtils'
import { preparePayload } from './payloadUtils'
import { callFirePredictionAPI } from './firePredictionClient'

/**
 * Get all grid cells within a bounding box
 * @param {Object} bounds - Bounding box {north, south, east, west}
 * @param {number} cellSizeKm - Grid cell size in km
 * @returns {Array<Object>} Array of grid cells {x, y, lat, lon, bounds}
 */
export function getGridCellsInBounds(bounds, cellSizeKm = GRID_CONFIG.CELL_SIZE_KM) {
  const { north, south, east, west } = bounds

  // Calculate grid range
  const southLatKm = (south - GRID_CONFIG.ORIGIN_LAT) * GRID_CONFIG.KM_PER_DEGREE_LAT
  const northLatKm = (north - GRID_CONFIG.ORIGIN_LAT) * GRID_CONFIG.KM_PER_DEGREE_LAT
  
  const avgLat = (south + north) / 2
  const kmPerDegreeLon = GRID_CONFIG.KM_PER_DEGREE_LON * Math.cos(avgLat * Math.PI / 180)
  
  const westLonKm = (west - GRID_CONFIG.ORIGIN_LON) * kmPerDegreeLon
  const eastLonKm = (east - GRID_CONFIG.ORIGIN_LON) * kmPerDegreeLon

  // Calculate grid cell indices
  const minY = Math.floor(southLatKm / cellSizeKm)
  const maxY = Math.floor(northLatKm / cellSizeKm)
  const minX = Math.floor(westLonKm / cellSizeKm)
  const maxX = Math.floor(eastLonKm / cellSizeKm)

  // Generate all grid cells
  const cells = []
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const { lat, lon } = convertXYToLatLon(x, y, cellSizeKm)
      const cellBounds = getGridCellBounds(x, y, cellSizeKm)
      
      cells.push({
        x,
        y,
        lat,
        lon,
        bounds: {
          minLat: cellBounds.south,
          maxLat: cellBounds.north,
          minLon: cellBounds.west,
          maxLon: cellBounds.east
        }
      })
    }
  }

  return cells
}

/**
 * Fetch weather for a location (simplified - uses provided weather or defaults)
 * @param {Object} location - {lat, lon}
 * @param {Object} defaultWeather - Default weather to use
 * @returns {Promise<Object>} Weather data
 */
async function fetchWeatherForLocation(location, defaultWeather) {
  // In production, you'd fetch from Open-Meteo for each location
  // For now, use provided weather or reasonable defaults
  return defaultWeather || {
    temp: 30,
    RH: 50,
    wind: 10,
    rain: 0
  }
}

/**
 * Batch predict fire risk for multiple grid cells
 * @param {Array<Object>} cells - Array of grid cells from getGridCellsInBounds
 * @param {Object} weatherData - Weather data to use for all cells
 * @param {Object} options - Options {concurrency, onProgress, stopOnError}
 * @returns {Promise<Object>} Results {predictions, errors, summary}
 */
export async function batchPredictCells(cells, weatherData, options = {}) {
  const {
    concurrency = 3,
    onProgress = null,
    stopOnError = false
  } = options

  const predictions = []
  const errors = []
  let completed = 0

  // Process in batches
  for (let i = 0; i < cells.length; i += concurrency) {
    const batch = cells.slice(i, i + concurrency)
    
    const batchPromises = batch.map(async (cell, idx) => {
      const globalIndex = i + idx
      
      try {
        // Prepare payload
        const weather = await fetchWeatherForLocation(
          { lat: cell.lat, lon: cell.lon },
          weatherData
        )

        const payloadResult = preparePayload({
          X: cell.x,
          Y: cell.y,
          lat: cell.lat,
          lng: cell.lon,
          weather
        })

        if (!payloadResult.valid) {
          throw new Error(`Payload validation failed: ${payloadResult.errors.join(', ')}`)
        }

        // Call API
        const response = await callFirePredictionAPI(payloadResult.payload)

        if (!response.success) {
          throw new Error(response.error.message)
        }

        completed++
        if (onProgress) {
          onProgress({
            completed,
            total: cells.length,
            current: cell,
            result: response.data
          })
        }

        return {
          success: true,
          cell,
          payload: payloadResult.payload,
          prediction: response.data,
          index: globalIndex
        }
      } catch (error) {
        completed++
        if (onProgress) {
          onProgress({
            completed,
            total: cells.length,
            current: cell,
            error: error.message
          })
        }

        const errorResult = {
          success: false,
          cell,
          error: error.message,
          index: globalIndex
        }

        if (stopOnError) {
          throw errorResult
        }

        return errorResult
      }
    })

    const batchResults = await Promise.all(batchPromises)
    
    for (const result of batchResults) {
      if (result.success) {
        predictions.push(result)
      } else {
        errors.push(result)
      }
    }

    // Small delay between batches to avoid overwhelming API
    if (i + concurrency < cells.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return {
    predictions,
    errors,
    summary: {
      total: cells.length,
      successful: predictions.length,
      failed: errors.length,
      successRate: ((predictions.length / cells.length) * 100).toFixed(1) + '%'
    }
  }
}

/**
 * Animate predictions by yielding results one at a time
 * @param {Array<Object>} predictions - Array of prediction results
 * @param {Function} onPrediction - Callback for each prediction
 * @param {number} delayMs - Delay between animations in ms
 */
export async function animatePredictions(predictions, onPrediction, delayMs = 200) {
  for (const prediction of predictions) {
    onPrediction(prediction)
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

/**
 * Group predictions by risk level
 * @param {Array<Object>} predictions - Prediction results
 * @returns {Object} Grouped by bucket {low: [], medium: [], high: [], critical: []}
 */
export function groupPredictionsByRisk(predictions) {
  const groups = {
    low: [],
    medium: [],
    high: [],
    critical: [],
    unknown: []
  }

  predictions.forEach(pred => {
    if (pred.success && pred.prediction) {
      const bucket = pred.prediction.bucket?.toLowerCase() || 'unknown'
      if (groups[bucket]) {
        groups[bucket].push(pred)
      } else {
        groups.unknown.push(pred)
      }
    }
  })

  return groups
}

/**
 * Calculate statistics from batch predictions
 * @param {Array<Object>} predictions - Prediction results
 * @returns {Object} Statistics
 */
export function calculatePredictionStats(predictions) {
  const successful = predictions.filter(p => p.success)
  
  if (successful.length === 0) {
    return {
      count: 0,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      riskDistribution: {}
    }
  }

  const scores = successful
    .map(p => p.prediction?.score)
    .filter(s => s !== null && s !== undefined)

  const grouped = groupPredictionsByRisk(predictions)

  return {
    count: successful.length,
    avgScore: scores.length > 0 
      ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(3)
      : 0,
    maxScore: scores.length > 0 ? Math.max(...scores).toFixed(3) : 0,
    minScore: scores.length > 0 ? Math.min(...scores).toFixed(3) : 0,
    riskDistribution: {
      low: grouped.low.length,
      medium: grouped.medium.length,
      high: grouped.high.length,
      critical: grouped.critical.length
    }
  }
}

export default {
  getGridCellsInBounds,
  batchPredictCells,
  animatePredictions,
  groupPredictionsByRisk,
  calculatePredictionStats
}
