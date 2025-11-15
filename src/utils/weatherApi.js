import axios from 'axios'

/**
 * Weather and Risk API Service
 */
const weatherApi = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
weatherApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('api_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
weatherApi.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.message)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('api_token')
      // Handle unauthorized
    }
    
    if (error.response?.status === 404) {
      console.warn('Endpoint not found:', error.config.url)
    }
    
    return Promise.reject(error)
  }
)

/**
 * Weather API Endpoints
 */
export const weatherService = {
  // Get current weather for a location
  getCurrentWeather: async (lat, lon) => {
    const response = await weatherApi.get('/weather/current', {
      params: { lat, lon }
    })
    return response.data
  },

  // Get weather forecast
  getForecast: async (lat, lon, days = 7) => {
    const response = await weatherApi.get('/weather/forecast', {
      params: { lat, lon, days }
    })
    return response.data
  },

  // Get weather for multiple locations
  getBulkWeather: async (locations) => {
    const response = await weatherApi.post('/weather/bulk', { locations })
    return response.data
  },

  // Get historical weather data
  getHistoricalWeather: async (lat, lon, startDate, endDate) => {
    const response = await weatherApi.get('/weather/historical', {
      params: { lat, lon, startDate, endDate }
    })
    return response.data
  },
}

/**
 * Risk Assessment API Endpoints
 */
export const riskService = {
  // Get risk assessment for a location
  getRiskAssessment: async (lat, lon) => {
    const response = await weatherApi.get('/risk/assessment', {
      params: { lat, lon }
    })
    return response.data
  },

  // Get risk alerts for a region
  getRiskAlerts: async (region) => {
    const response = await weatherApi.get('/risk/alerts', {
      params: { region }
    })
    return response.data
  },

  // Get all active risk zones
  getRiskZones: async () => {
    const response = await weatherApi.get('/risk/zones')
    return response.data
  },

  // Get risk predictions
  getRiskPredictions: async (lat, lon, days = 3) => {
    const response = await weatherApi.get('/risk/predictions', {
      params: { lat, lon, days }
    })
    return response.data
  },

  // Get risk statistics
  getRiskStatistics: async () => {
    const response = await weatherApi.get('/risk/statistics')
    return response.data
  },

  // Get fire hotspots
  getFireHotspots: async () => {
    const response = await weatherApi.get('/risk/fire-hotspots')
    return response.data
  },
}

/**
 * Location API Endpoints
 */
export const locationService = {
  // Get all locations
  getAllLocations: async () => {
    const response = await weatherApi.get('/locations')
    return response.data
  },

  // Get location details
  getLocationDetails: async (locationId) => {
    const response = await weatherApi.get(`/locations/${locationId}`)
    return response.data
  },

  // Search locations
  searchLocations: async (query) => {
    const response = await weatherApi.get('/locations/search', {
      params: { q: query }
    })
    return response.data
  },
}

export default weatherApi
