/**
 * Payload preparation utilities for fire prediction API
 * Transforms location and weather data into API-compatible format
 */

/**
 * Month mapping (full month names to 3-letter abbreviations)
 */
const MONTH_MAP = {
  0: 'jan',  // January
  1: 'feb',  // February
  2: 'mar',  // March
  3: 'apr',  // April
  4: 'may',  // May
  5: 'jun',  // June
  6: 'jul',  // July
  7: 'aug',  // August
  8: 'sep',  // September
  9: 'oct',  // October
  10: 'nov', // November
  11: 'dec'  // December
}

/**
 * Day of week mapping (0=Sunday to 6=Saturday)
 */
const DAY_MAP = {
  0: 'sun',  // Sunday
  1: 'mon',  // Monday
  2: 'tue',  // Tuesday
  3: 'wed',  // Wednesday
  4: 'thu',  // Thursday
  5: 'fri',  // Friday
  6: 'sat'   // Saturday
}

/**
 * Get current month as 3-letter lowercase abbreviation
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Month abbreviation (e.g., 'aug', 'jan')
 */
export function getMonthString(date = new Date()) {
  const monthIndex = date.getMonth()
  return MONTH_MAP[monthIndex] || 'jan'
}

/**
 * Get current day of week as 3-letter lowercase abbreviation
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Day abbreviation (e.g., 'sun', 'mon')
 */
export function getDayString(date = new Date()) {
  const dayIndex = date.getDay()
  return DAY_MAP[dayIndex] || 'sun'
}

/**
 * Validate a single field value
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {string} type - Expected type ('number', 'string', 'integer')
 * @param {Object} constraints - Optional constraints (min, max, allowed values)
 * @returns {{valid: boolean, error: string|null}}
 */
function validateField(fieldName, value, type, constraints = {}) {
  // Check for null/undefined
  if (value === null || value === undefined) {
    if (constraints.optional) {
      return { valid: true, error: null }
    }
    return { valid: false, error: `${fieldName} is required but is null/undefined` }
  }

  // Type validation
  if (type === 'number' || type === 'integer') {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, error: `${fieldName} must be a valid number, got ${typeof value}` }
    }
    if (type === 'integer' && !Number.isInteger(value)) {
      return { valid: false, error: `${fieldName} must be an integer, got ${value}` }
    }
    // Range validation
    if (constraints.min !== undefined && value < constraints.min) {
      return { valid: false, error: `${fieldName} must be >= ${constraints.min}, got ${value}` }
    }
    if (constraints.max !== undefined && value > constraints.max) {
      return { valid: false, error: `${fieldName} must be <= ${constraints.max}, got ${value}` }
    }
  } else if (type === 'string') {
    if (typeof value !== 'string') {
      return { valid: false, error: `${fieldName} must be a string, got ${typeof value}` }
    }
    // Allowed values validation
    if (constraints.allowed && !constraints.allowed.includes(value)) {
      return { valid: false, error: `${fieldName} must be one of [${constraints.allowed.join(', ')}], got '${value}'` }
    }
  }

  return { valid: true, error: null }
}

/**
 * Validate the complete payload
 * @param {Object} payload - Payload to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validatePayload(payload) {
  const errors = []

  // Define validation rules
  const rules = [
    { field: 'X', type: 'integer', constraints: {} },
    { field: 'Y', type: 'integer', constraints: {} },
    { 
      field: 'month', 
      type: 'string', 
      constraints: { 
        allowed: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] 
      } 
    },
    { 
      field: 'day', 
      type: 'string', 
      constraints: { 
        allowed: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] 
      } 
    },
    { field: 'temp', type: 'number', constraints: { min: -50, max: 60 } },
    { field: 'RH', type: 'number', constraints: { min: 0, max: 100 } },
    { field: 'wind', type: 'number', constraints: { min: 0, max: 200 } },
    { field: 'rain', type: 'number', constraints: { min: 0 } }
  ]

  // Validate each field
  rules.forEach(rule => {
    const result = validateField(
      rule.field,
      payload[rule.field],
      rule.type,
      rule.constraints
    )
    if (!result.valid) {
      errors.push(result.error)
    }
  })

  // Check for extra fields (optional warning)
  const allowedFields = new Set(rules.map(r => r.field))
  Object.keys(payload).forEach(key => {
    if (!allowedFields.has(key)) {
      console.warn(`Warning: Unexpected field '${key}' in payload`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Prepare API payload from location and weather data
 * @param {Object} params - Input parameters
 * @param {number} params.X - Grid X coordinate (integer)
 * @param {number} params.Y - Grid Y coordinate (integer)
 * @param {number} params.lat - Latitude (for reference, not in payload)
 * @param {number} params.lng - Longitude (for reference, not in payload)
 * @param {Object} params.weather - Weather data object
 * @param {number} params.weather.temp - Temperature in °C
 * @param {number} params.weather.RH - Relative humidity in %
 * @param {number} params.weather.wind - Wind speed in km/h
 * @param {number} params.weather.rain - Rainfall in mm
 * @param {Date} [params.date] - Optional date (defaults to current date)
 * @returns {{payload: Object|null, valid: boolean, errors: string[]}}
 */
export function preparePayload(params) {
  const { X, Y, lat, lng, weather, date = new Date() } = params

  // Validate input structure
  if (!weather || typeof weather !== 'object') {
    return {
      payload: null,
      valid: false,
      errors: ['Weather data is required and must be an object']
    }
  }

  // Extract and compute fields
  const month = getMonthString(date)
  const day = getDayString(date)

  // Build payload matching API schema
  const payload = {
    X: Number.isInteger(X) ? X : Math.floor(X),
    Y: Number.isInteger(Y) ? Y : Math.floor(Y),
    month,
    day,
    temp: weather.temp !== null && weather.temp !== undefined ? Number(weather.temp) : null,
    RH: weather.RH !== null && weather.RH !== undefined ? Number(weather.RH) : null,
    wind: weather.wind !== null && weather.wind !== undefined ? Number(weather.wind) : null,
    rain: weather.rain !== null && weather.rain !== undefined ? Number(weather.rain) : 0
  }

  // Validate the payload
  const validation = validatePayload(payload)

  return {
    payload: validation.valid ? payload : null,
    valid: validation.valid,
    errors: validation.errors,
    metadata: {
      originalLat: lat,
      originalLng: lng,
      timestamp: date.toISOString(),
      weatherSource: 'Open-Meteo API'
    }
  }
}

/**
 * Prepare batch payloads for multiple locations
 * @param {Array<Object>} locations - Array of location/weather objects
 * @param {Date} [date] - Optional date (defaults to current date)
 * @returns {{payloads: Object[], valid: boolean, errors: Object[]}}
 */
export function prepareBatchPayloads(locations, date = new Date()) {
  const results = locations.map((loc, index) => {
    const result = preparePayload({ ...loc, date })
    return {
      index,
      ...result
    }
  })

  const validPayloads = results.filter(r => r.valid).map(r => r.payload)
  const allErrors = results
    .filter(r => !r.valid)
    .map(r => ({ index: r.index, errors: r.errors }))

  return {
    payloads: validPayloads,
    valid: allErrors.length === 0,
    errors: allErrors,
    totalCount: locations.length,
    validCount: validPayloads.length,
    invalidCount: allErrors.length
  }
}

/**
 * Format payload for display/logging
 * @param {Object} payload - API payload
 * @returns {string} Formatted JSON string
 */
export function formatPayload(payload) {
  return JSON.stringify(payload, null, 2)
}

/**
 * Example usage and payload templates
 */
export const PAYLOAD_EXAMPLE = {
  X: 123,
  Y: 456,
  month: 'aug',
  day: 'sun',
  temp: 28.5,
  RH: 65,
  wind: 12.3,
  rain: 0
}

export const PAYLOAD_SCHEMA = {
  type: 'object',
  required: ['X', 'Y', 'month', 'day', 'temp', 'RH', 'wind', 'rain'],
  properties: {
    X: { type: 'integer', description: 'Grid X coordinate' },
    Y: { type: 'integer', description: 'Grid Y coordinate' },
    month: { 
      type: 'string', 
      enum: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
      description: '3-letter month abbreviation (lowercase)'
    },
    day: { 
      type: 'string', 
      enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      description: '3-letter day abbreviation (lowercase)'
    },
    temp: { type: 'number', minimum: -50, maximum: 60, description: 'Temperature in °C' },
    RH: { type: 'number', minimum: 0, maximum: 100, description: 'Relative humidity in %' },
    wind: { type: 'number', minimum: 0, maximum: 200, description: 'Wind speed in km/h' },
    rain: { type: 'number', minimum: 0, description: 'Rainfall in mm' }
  }
}
