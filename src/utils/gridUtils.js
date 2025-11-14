/**
 * Grid conversion utilities for converting lat/lon to grid coordinates
 */

// Grid configuration - can be adjusted as needed
export const GRID_CONFIG = {
  // Grid cell size in kilometers
  CELL_SIZE_KM: 1.0, // Default 1km x 1km grid
  // Alternative: 0.5 for 0.5km x 0.5km grid
  
  // Reference point (origin) for grid - Southwest corner of India approximately
  ORIGIN_LAT: 8.0,
  ORIGIN_LON: 68.0,
  
  // Approximate conversion factors (at mid-latitudes in India)
  // 1 degree latitude ≈ 111 km
  // 1 degree longitude ≈ 111 km * cos(latitude)
  KM_PER_DEGREE_LAT: 111.32,
  KM_PER_DEGREE_LON: 111.32, // Will be adjusted by cosine of latitude
}

/**
 * Convert latitude/longitude to grid cell coordinates (X, Y)
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees
 * @param {number} cellSizeKm - Grid cell size in kilometers (default: 1.0)
 * @returns {{x: number, y: number, centerLat: number, centerLon: number}}
 */
export function convertLatLonToXY(lat, lon, cellSizeKm = GRID_CONFIG.CELL_SIZE_KM) {
  // Calculate distance from origin in kilometers
  const latDistanceKm = (lat - GRID_CONFIG.ORIGIN_LAT) * GRID_CONFIG.KM_PER_DEGREE_LAT
  
  // Adjust longitude conversion by latitude (cosine correction)
  const avgLat = (lat + GRID_CONFIG.ORIGIN_LAT) / 2
  const kmPerDegreeLon = GRID_CONFIG.KM_PER_DEGREE_LON * Math.cos(avgLat * Math.PI / 180)
  const lonDistanceKm = (lon - GRID_CONFIG.ORIGIN_LON) * kmPerDegreeLon
  
  // Convert to grid coordinates (floor to get cell index)
  const x = Math.floor(lonDistanceKm / cellSizeKm)
  const y = Math.floor(latDistanceKm / cellSizeKm)
  
  // Calculate center of the grid cell for accurate marker placement
  const centerLat = GRID_CONFIG.ORIGIN_LAT + ((y + 0.5) * cellSizeKm) / GRID_CONFIG.KM_PER_DEGREE_LAT
  const centerLon = GRID_CONFIG.ORIGIN_LON + ((x + 0.5) * cellSizeKm) / kmPerDegreeLon
  
  return {
    x,
    y,
    centerLat,
    centerLon
  }
}

/**
 * Convert grid cell coordinates (X, Y) back to latitude/longitude
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @param {number} cellSizeKm - Grid cell size in kilometers (default: 1.0)
 * @returns {{lat: number, lon: number}}
 */
export function convertXYToLatLon(x, y, cellSizeKm = GRID_CONFIG.CELL_SIZE_KM) {
  // Calculate center of the grid cell
  const lat = GRID_CONFIG.ORIGIN_LAT + ((y + 0.5) * cellSizeKm) / GRID_CONFIG.KM_PER_DEGREE_LAT
  
  const avgLat = (lat + GRID_CONFIG.ORIGIN_LAT) / 2
  const kmPerDegreeLon = GRID_CONFIG.KM_PER_DEGREE_LON * Math.cos(avgLat * Math.PI / 180)
  const lon = GRID_CONFIG.ORIGIN_LON + ((x + 0.5) * cellSizeKm) / kmPerDegreeLon
  
  return { lat, lon }
}

/**
 * Get the bounds of a grid cell
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @param {number} cellSizeKm - Grid cell size in kilometers (default: 1.0)
 * @returns {{north: number, south: number, east: number, west: number}}
 */
export function getGridCellBounds(x, y, cellSizeKm = GRID_CONFIG.CELL_SIZE_KM) {
  const southLat = GRID_CONFIG.ORIGIN_LAT + (y * cellSizeKm) / GRID_CONFIG.KM_PER_DEGREE_LAT
  const northLat = GRID_CONFIG.ORIGIN_LAT + ((y + 1) * cellSizeKm) / GRID_CONFIG.KM_PER_DEGREE_LAT
  
  const avgLat = (southLat + northLat) / 2
  const kmPerDegreeLon = GRID_CONFIG.KM_PER_DEGREE_LON * Math.cos(avgLat * Math.PI / 180)
  
  const westLon = GRID_CONFIG.ORIGIN_LON + (x * cellSizeKm) / kmPerDegreeLon
  const eastLon = GRID_CONFIG.ORIGIN_LON + ((x + 1) * cellSizeKm) / kmPerDegreeLon
  
  return {
    north: northLat,
    south: southLat,
    east: eastLon,
    west: westLon
  }
}

/**
 * Format grid coordinates as a display string
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @returns {string}
 */
export function formatGridCoordinates(x, y) {
  return `Grid[${x}, ${y}]`
}

/**
 * Calculate distance between two lat/lon points (Haversine formula)
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
