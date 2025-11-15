/**
 * Fire Prediction API Client
 * Sends POST requests to the forest fire ML model endpoint
 * API: https://forestfiremlmodel.onrender.com/predict
 */

const API_BASE_URL = 'https://forestfiremlmodel.onrender.com'
const PREDICT_ENDPOINT = '/predict'
const REQUEST_TIMEOUT = 60000 // 60 seconds (increased for cold starts)

/**
 * Call the fire prediction API
 * @param {Object} payload - Request payload matching API schema
 * @param {number} payload.X - Grid X coordinate
 * @param {number} payload.Y - Grid Y coordinate
 * @param {string} payload.month - Month abbreviation (jan-dec)
 * @param {string} payload.day - Day abbreviation (sun-sat)
 * @param {number} payload.temp - Temperature in °C
 * @param {number} payload.RH - Relative humidity in %
 * @param {number} payload.wind - Wind speed in km/h
 * @param {number} payload.rain - Rainfall in mm
 * @returns {Promise<Object>} Prediction result {score, bucket, color, features_used}
 */
export async function callFirePredictionAPI(payload) {
  const url = `${API_BASE_URL}${PREDICT_ENDPOINT}`
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    // Make POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    // Clear timeout
    clearTimeout(timeoutId)

    // Handle different status codes
    if (response.ok) {
      // 200 Success
      const data = await response.json()
      
      return {
        success: true,
        data: {
          score: data.score ?? data.prediction_score ?? null,
          bucket: data.bucket ?? data.risk_bucket ?? data.category ?? null,
          color: data.color ?? data.risk_color ?? null,
          features_used: data.features_used ?? data.features ?? null,
        },
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      }
    } else if (response.status === 400) {
      // 400 Bad Request - Validation error
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: 'Invalid request payload' }
      }

      return {
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: errorData.message || errorData.error || 'Invalid payload format',
          details: errorData.details || errorData.errors || null,
        },
        statusCode: 400,
        timestamp: new Date().toISOString(),
      }
    } else if (response.status >= 500) {
      // 500+ Server Error
      return {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: `Server error: ${response.status} ${response.statusText}`,
          details: null,
        },
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      }
    } else {
      // Other HTTP errors
      return {
        success: false,
        error: {
          type: 'HTTP_ERROR',
          message: `HTTP error: ${response.status} ${response.statusText}`,
          details: null,
        },
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    // Network errors, timeout, abort, etc.
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: {
          type: 'TIMEOUT_ERROR',
          message: `Request timeout after ${REQUEST_TIMEOUT / 1000} seconds`,
          details: null,
        },
        statusCode: null,
        timestamp: new Date().toISOString(),
      }
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: 'Network error - unable to reach API server',
          details: error.message,
        },
        statusCode: null,
        timestamp: new Date().toISOString(),
      }
    }

    // Unknown error
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error.stack || null,
      },
      statusCode: null,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Batch prediction for multiple locations
 * @param {Array<Object>} payloads - Array of prediction payloads
 * @param {Object} options - Options for batch processing
 * @param {number} options.concurrency - Max concurrent requests (default: 3)
 * @param {boolean} options.stopOnError - Stop on first error (default: false)
 * @returns {Promise<Object>} Batch results
 */
export async function callBatchFirePrediction(payloads, options = {}) {
  const { concurrency = 3, stopOnError = false } = options
  
  const results = []
  const errors = []
  
  // Process in batches
  for (let i = 0; i < payloads.length; i += concurrency) {
    const batch = payloads.slice(i, i + concurrency)
    
    const batchPromises = batch.map(async (payload, idx) => {
      const globalIndex = i + idx
      try {
        const result = await callFirePredictionAPI(payload)
        return { index: globalIndex, result, payload }
      } catch (error) {
        return {
          index: globalIndex,
          result: {
            success: false,
            error: {
              type: 'EXCEPTION',
              message: error.message,
              details: null
            }
          },
          payload
        }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    
    for (const item of batchResults) {
      if (item.result.success) {
        results.push(item)
      } else {
        errors.push(item)
        if (stopOnError) {
          return {
            success: false,
            results,
            errors,
            totalProcessed: results.length + errors.length,
            totalRequested: payloads.length,
            message: 'Stopped on first error'
          }
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
    totalProcessed: results.length + errors.length,
    totalRequested: payloads.length,
    successRate: (results.length / payloads.length * 100).toFixed(2) + '%'
  }
}

/**
 * Check API health/availability
 * @returns {Promise<Object>} Health check result
 */
export async function checkAPIHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    return {
      available: response.ok || response.status === 404, // 404 is ok, means server is up
      statusCode: response.status,
      message: response.ok ? 'API is available' : `Server responded with ${response.status}`,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      available: false,
      statusCode: null,
      message: error.name === 'AbortError' ? 'Request timeout' : 'Cannot reach API server',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Parse and format API response for display
 * @param {Object} response - API response from callFirePredictionAPI
 * @returns {Object} Formatted response
 */
export function formatAPIResponse(response) {
  if (!response.success) {
    return {
      status: 'error',
      message: response.error.message,
      errorType: response.error.type,
      details: response.error.details,
    }
  }

  const { score, bucket, color } = response.data

  return {
    status: 'success',
    prediction: {
      score: score,
      riskLevel: bucket || 'unknown',
      color: color || '#999',
      confidence: score !== null ? `${(score * 100).toFixed(1)}%` : 'N/A',
    },
    raw: response.data,
  }
}

/**
 * Get risk level description based on bucket
 * @param {string} bucket - Risk bucket from API
 * @returns {string} Human-readable description
 */
export function getRiskDescription(bucket) {
  const descriptions = {
    'low': 'Low fire risk - Conditions are favorable',
    'medium': 'Moderate fire risk - Monitor conditions closely',
    'high': 'High fire risk - Exercise extreme caution',
    'critical': 'Critical fire risk - Immediate action required',
    'extreme': 'Extreme fire danger - Emergency protocols',
  }

  return descriptions[bucket?.toLowerCase()] || 'Unknown risk level'
}

/**
 * API configuration and constants
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  PREDICT_ENDPOINT,
  TIMEOUT: REQUEST_TIMEOUT,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
}

/**
 * Retry wrapper for API calls
 * @param {Object} payload - Prediction payload
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} API response
 */
export async function callWithRetry(payload, maxRetries = API_CONFIG.MAX_RETRIES) {
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await callFirePredictionAPI(payload)
      
      // Don't retry on validation errors (400)
      if (!result.success && result.error.type === 'VALIDATION_ERROR') {
        return result
      }

      // Return on success
      if (result.success) {
        return result
      }

      // Store error for potential retry
      lastError = result

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, attempt))
        )
      }
    } catch (error) {
      lastError = {
        success: false,
        error: {
          type: 'RETRY_FAILED',
          message: error.message,
          details: `Attempt ${attempt + 1} of ${maxRetries}`
        }
      }
    }
  }

  return lastError || {
    success: false,
    error: {
      type: 'MAX_RETRIES_EXCEEDED',
      message: `Failed after ${maxRetries} attempts`,
      details: null
    }
  }
}

export default {
  callFirePredictionAPI,
  callBatchFirePrediction,
  checkAPIHealth,
  formatAPIResponse,
  getRiskDescription,
  callWithRetry,
  API_CONFIG,
}
