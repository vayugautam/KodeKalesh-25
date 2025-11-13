import axios from 'axios'

/**
 * Open-Meteo Weather API Service
 * Free weather forecast API - https://open-meteo.com/
 */

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1'

/**
 * Get current weather and forecast for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise} Weather data
 */
export const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code',
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: 7
      }
    })

    return {
      current: {
        temperature: response.data.current.temperature_2m,
        humidity: response.data.current.relative_humidity_2m,
        windSpeed: response.data.current.wind_speed_10m,
        windDirection: response.data.current.wind_direction_10m,
        weatherCode: response.data.current.weather_code,
        time: response.data.current.time,
      },
      hourly: response.data.hourly,
      daily: response.data.daily,
      location: {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone,
      }
    }
  } catch (error) {
    console.error('Open-Meteo API Error:', error)
    throw error
  }
}

/**
 * Get detailed forecast for multiple days
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of forecast days (1-16)
 * @returns {Promise} Forecast data
 */
export const getForecast = async (lat, lon, days = 7) => {
  try {
    const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
        daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
        timezone: 'auto',
        forecast_days: Math.min(days, 16)
      }
    })

    return response.data
  } catch (error) {
    console.error('Open-Meteo Forecast Error:', error)
    throw error
  }
}

/**
 * Get historical weather data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} Historical data
 */
export const getHistoricalWeather = async (lat, lon, startDate, endDate) => {
  try {
    const response = await axios.get(`${OPEN_METEO_BASE_URL}/archive`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: startDate,
        end_date: endDate,
        hourly: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        timezone: 'auto'
      }
    })

    return response.data
  } catch (error) {
    console.error('Open-Meteo Historical Data Error:', error)
    throw error
  }
}

/**
 * Get weather for multiple locations (batch request)
 * @param {Array} locations - Array of {lat, lon} objects
 * @returns {Promise} Array of weather data
 */
export const getBulkWeather = async (locations) => {
  try {
    const promises = locations.map(loc => getCurrentWeather(loc.lat, loc.lon))
    return await Promise.all(promises)
  } catch (error) {
    console.error('Bulk Weather Error:', error)
    throw error
  }
}

/**
 * Calculate fire risk based on weather conditions
 * @param {Object} weather - Current weather data
 * @returns {Object} Risk assessment
 */
export const calculateFireRisk = (weather) => {
  const { temperature, humidity, windSpeed } = weather.current

  // Simple fire risk calculation (0-100)
  let riskScore = 0

  // Temperature factor (higher temp = higher risk)
  if (temperature > 35) riskScore += 40
  else if (temperature > 30) riskScore += 30
  else if (temperature > 25) riskScore += 20
  else riskScore += 10

  // Humidity factor (lower humidity = higher risk)
  if (humidity < 20) riskScore += 40
  else if (humidity < 40) riskScore += 30
  else if (humidity < 60) riskScore += 20
  else riskScore += 10

  // Wind speed factor (higher wind = higher risk)
  if (windSpeed > 30) riskScore += 20
  else if (windSpeed > 20) riskScore += 15
  else if (windSpeed > 10) riskScore += 10
  else riskScore += 5

  // Determine risk level
  let riskLevel = 'Low'
  let color = '#4caf50'
  
  if (riskScore >= 80) {
    riskLevel = 'Critical'
    color = '#d32f2f'
  } else if (riskScore >= 60) {
    riskLevel = 'High'
    color = '#f44336'
  } else if (riskScore >= 40) {
    riskLevel = 'Moderate'
    color = '#ff9800'
  }

  return {
    score: riskScore,
    level: riskLevel,
    color,
    factors: {
      temperature,
      humidity,
      windSpeed,
    }
  }
}

/**
 * Weather code descriptions
 * https://open-meteo.com/en/docs
 */
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }

  return weatherCodes[code] || 'Unknown'
}

export default {
  getCurrentWeather,
  getForecast,
  getHistoricalWeather,
  getBulkWeather,
  calculateFireRisk,
  getWeatherDescription,
}
