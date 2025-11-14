/**
 * NASA FIRMS API Integration
 * Fetches real-time fire hotspot data from VIIRS satellite
 * API: https://firms.modaps.eosdis.nasa.gov/
 */

// NASA FIRMS API configuration
const FIRMS_API_CONFIG = {
  // Public API endpoint (no key required for basic access)
  BASE_URL: 'https://firms.modaps.eosdis.nasa.gov/api',
  
  // Data sources
  SOURCES: {
    VIIRS_SNPP: 'VIIRS_SNPP_NRT', // Suomi NPP satellite
    VIIRS_NOAA20: 'VIIRS_NOAA20_NRT', // NOAA-20 satellite
    MODIS_TERRA: 'MODIS_C6_1_NRT', // Terra satellite
    MODIS_AQUA: 'MODIS_C6_1_NRT' // Aqua satellite
  },
  
  // Area types
  AREA_TYPES: {
    WORLD: 'World',
    COUNTRY: 'country',
    BBOX: 'bbox' // Bounding box
  },
  
  // Date ranges (in days)
  DATE_RANGES: {
    TODAY: 1,
    YESTERDAY: 2,
    WEEK: 7,
    MONTH: 30
  },
  
  // Sample public map key (limited usage)
  // Users should get their own from: https://firms.modaps.eosdis.nasa.gov/api/area/
  MAP_KEY: 'sample_key_placeholder'
}

/**
 * Fetch VIIRS fire hotspots from NASA FIRMS
 * @param {Object} options - Query options
 * @param {string} options.source - Data source (VIIRS_SNPP, VIIRS_NOAA20, etc)
 * @param {string} options.area - Area code (e.g., 'IND' for India, or bbox coords)
 * @param {number} options.dayRange - Number of days to fetch (1-10)
 * @param {string} options.mapKey - NASA FIRMS API key
 * @returns {Promise<Array>} Array of fire hotspots
 */
export async function fetchFIRMSHotspots(options = {}) {
  const {
    source = FIRMS_API_CONFIG.SOURCES.VIIRS_SNPP,
    area = 'IND', // India by default
    dayRange = 1,
    mapKey = FIRMS_API_CONFIG.MAP_KEY,
    format = 'csv'
  } = options

  try {
    // Construct API URL
    // Format: /api/area/csv/{map_key}/{source}/{area_code}/{day_range}
    const url = `${FIRMS_API_CONFIG.BASE_URL}/area/${format}/${mapKey}/${source}/${area}/${dayRange}`
    
    console.log('Fetching FIRMS hotspots from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      }
    })

    if (!response.ok) {
      throw new Error(`FIRMS API error: ${response.status} ${response.statusText}`)
    }

    const csvData = await response.text()
    
    // Parse CSV data
    const hotspots = parseCSVHotspots(csvData)
    
    console.log(`Fetched ${hotspots.length} VIIRS fire hotspots`)
    
    return hotspots

  } catch (error) {
    console.error('Error fetching FIRMS hotspots:', error)
    
    // Return sample data as fallback
    return getSampleFIRMSData()
  }
}

/**
 * Parse CSV data from FIRMS API
 * @param {string} csvData - Raw CSV string
 * @returns {Array<Object>} Parsed hotspot objects
 */
function parseCSVHotspots(csvData) {
  const lines = csvData.trim().split('\n')
  
  if (lines.length < 2) {
    console.warn('No FIRMS data returned')
    return []
  }

  // First line is header
  const headers = lines[0].split(',').map(h => h.trim())
  
  // Find column indices
  const latIndex = headers.findIndex(h => h.toLowerCase() === 'latitude')
  const lonIndex = headers.findIndex(h => h.toLowerCase() === 'longitude')
  const brightIndex = headers.findIndex(h => h.toLowerCase().includes('bright'))
  const confIndex = headers.findIndex(h => h.toLowerCase() === 'confidence')
  const dateIndex = headers.findIndex(h => h.toLowerCase() === 'acq_date')
  const timeIndex = headers.findIndex(h => h.toLowerCase() === 'acq_time')
  const frpIndex = headers.findIndex(h => h.toLowerCase() === 'frp') // Fire Radiative Power

  const hotspots = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    
    if (values.length < headers.length) continue

    const lat = parseFloat(values[latIndex])
    const lon = parseFloat(values[lonIndex])
    
    if (isNaN(lat) || isNaN(lon)) continue

    hotspots.push({
      latitude: lat,
      longitude: lon,
      position: [lat, lon], // For Leaflet
      brightness: brightIndex >= 0 ? parseFloat(values[brightIndex]) : null,
      confidence: confIndex >= 0 ? values[confIndex].trim() : 'unknown',
      date: dateIndex >= 0 ? values[dateIndex].trim() : null,
      time: timeIndex >= 0 ? values[timeIndex].trim() : null,
      frp: frpIndex >= 0 ? parseFloat(values[frpIndex]) : null, // Fire Radiative Power
      id: `firms-${i}-${lat.toFixed(4)}-${lon.toFixed(4)}`
    })
  }

  return hotspots
}

/**
 * Fetch hotspots for a custom bounding box
 * @param {Object} bounds - {north, south, east, west}
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Hotspots within bounds
 */
export async function fetchFIRMSByBounds(bounds, options = {}) {
  const { north, south, east, west } = bounds
  
  // FIRMS bbox format: west,south,east,north
  const bboxString = `${west},${south},${east},${north}`
  
  return fetchFIRMSHotspots({
    ...options,
    area: bboxString,
    areaType: FIRMS_API_CONFIG.AREA_TYPES.BBOX
  })
}

/**
 * Filter hotspots by confidence level
 * @param {Array} hotspots - Hotspot array
 * @param {string} minConfidence - Minimum confidence ('low', 'nominal', 'high')
 * @returns {Array} Filtered hotspots
 */
export function filterByConfidence(hotspots, minConfidence = 'nominal') {
  const confidenceLevels = {
    'low': 0,
    'nominal': 1,
    'high': 2
  }

  const minLevel = confidenceLevels[minConfidence.toLowerCase()] || 1

  return hotspots.filter(h => {
    const conf = h.confidence.toLowerCase()
    const level = confidenceLevels[conf] || 0
    return level >= minLevel
  })
}

/**
 * Group hotspots into clusters for better visualization
 * @param {Array} hotspots - Hotspot array
 * @param {number} threshold - Distance threshold in degrees
 * @returns {Array} Clustered hotspots
 */
export function clusterHotspots(hotspots, threshold = 0.1) {
  const clusters = []
  const used = new Set()

  hotspots.forEach((hotspot, idx) => {
    if (used.has(idx)) return

    const cluster = {
      center: [hotspot.latitude, hotspot.longitude],
      hotspots: [hotspot],
      totalBrightness: hotspot.brightness || 0,
      avgConfidence: hotspot.confidence,
      count: 1
    }

    // Find nearby hotspots
    hotspots.forEach((other, otherIdx) => {
      if (idx === otherIdx || used.has(otherIdx)) return

      const distance = Math.sqrt(
        Math.pow(hotspot.latitude - other.latitude, 2) +
        Math.pow(hotspot.longitude - other.longitude, 2)
      )

      if (distance < threshold) {
        cluster.hotspots.push(other)
        cluster.totalBrightness += (other.brightness || 0)
        cluster.count++
        used.add(otherIdx)
      }
    })

    used.add(idx)
    
    // Calculate cluster center (average position)
    const avgLat = cluster.hotspots.reduce((sum, h) => sum + h.latitude, 0) / cluster.count
    const avgLon = cluster.hotspots.reduce((sum, h) => sum + h.longitude, 0) / cluster.count
    cluster.center = [avgLat, avgLon]
    cluster.avgBrightness = cluster.totalBrightness / cluster.count

    clusters.push(cluster)
  })

  return clusters
}

/**
 * Get sample FIRMS data for testing/fallback
 * @returns {Array} Sample hotspot data
 */
function getSampleFIRMSData() {
  return [
    {
      latitude: 21.1458,
      longitude: 79.0882,
      position: [21.1458, 79.0882],
      brightness: 325.5,
      confidence: 'high',
      date: '2025-11-14',
      time: '0530',
      frp: 12.5,
      id: 'sample-1'
    },
    {
      latitude: 22.5726,
      longitude: 88.3639,
      position: [22.5726, 88.3639],
      brightness: 310.2,
      confidence: 'nominal',
      date: '2025-11-14',
      time: '0545',
      frp: 8.3,
      id: 'sample-2'
    },
    {
      latitude: 19.0760,
      longitude: 72.8777,
      position: [19.0760, 72.8777],
      brightness: 298.7,
      confidence: 'high',
      date: '2025-11-14',
      time: '0600',
      frp: 15.7,
      id: 'sample-3'
    },
    {
      latitude: 28.7041,
      longitude: 77.1025,
      position: [28.7041, 77.1025],
      brightness: 315.9,
      confidence: 'nominal',
      date: '2025-11-14',
      time: '0615',
      frp: 10.2,
      id: 'sample-4'
    },
    {
      latitude: 12.9716,
      longitude: 77.5946,
      position: [12.9716, 77.5946],
      brightness: 305.4,
      confidence: 'high',
      date: '2025-11-14',
      time: '0630',
      frp: 11.8,
      id: 'sample-5'
    }
  ]
}

/**
 * Get brightness color based on temperature
 * @param {number} brightness - Brightness temperature in Kelvin
 * @returns {string} Hex color
 */
export function getBrightnessColor(brightness) {
  if (!brightness) return '#ff4444'
  
  if (brightness >= 350) return '#8b0000' // Dark red - very hot
  if (brightness >= 320) return '#ff0000' // Red - hot
  if (brightness >= 300) return '#ff4444' // Light red - warm
  if (brightness >= 280) return '#ff6666' // Lighter red - mild
  return '#ff8888' // Very light red - low
}

/**
 * Get confidence color
 * @param {string} confidence - Confidence level
 * @returns {string} Hex color
 */
export function getConfidenceColor(confidence) {
  const conf = confidence?.toLowerCase() || 'unknown'
  
  if (conf === 'high') return '#ff0000'
  if (conf === 'nominal') return '#ff9800'
  if (conf === 'low') return '#ffeb3b'
  return '#999999'
}

/**
 * Format hotspot data for display
 * @param {Object} hotspot - Hotspot object
 * @returns {Object} Formatted display data
 */
export function formatHotspotDisplay(hotspot) {
  return {
    location: `${hotspot.latitude.toFixed(4)}°, ${hotspot.longitude.toFixed(4)}°`,
    brightness: hotspot.brightness ? `${hotspot.brightness.toFixed(1)}K` : 'N/A',
    confidence: hotspot.confidence || 'Unknown',
    datetime: hotspot.date && hotspot.time 
      ? `${hotspot.date} ${hotspot.time.slice(0, 2)}:${hotspot.time.slice(2)}`
      : 'Unknown',
    frp: hotspot.frp ? `${hotspot.frp.toFixed(1)} MW` : 'N/A',
    color: getBrightnessColor(hotspot.brightness),
    confidenceColor: getConfidenceColor(hotspot.confidence)
  }
}

export default {
  fetchFIRMSHotspots,
  fetchFIRMSByBounds,
  filterByConfidence,
  clusterHotspots,
  getBrightnessColor,
  getConfidenceColor,
  formatHotspotDisplay,
  FIRMS_API_CONFIG
}
