const axios = require('axios')

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1'

async function getCurrentWeather(lat, lon) {
  const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
      timezone: 'auto',
      forecast_days: 7
    }
  })

  const data = response.data || {}
  const current = data.current_weather || {}

  return {
    current: {
      temperature: current.temperature,
      windSpeed: current.windspeed,
      windDirection: current.winddirection,
      time: current.time
    },
    hourly: data.hourly || {},
    daily: data.daily || {},
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    }
  }
}

async function getForecast(lat, lon, days = 7) {
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
}

async function getHistoricalWeather(lat, lon, startDate, endDate) {
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
}

async function getBulkWeather(locations = []) {
  const promises = locations.map(loc => getCurrentWeather(loc.lat || loc.latitude, loc.lon || loc.longitude))
  return Promise.all(promises)
}

function calculateFireRisk(weather) {
  const temperature = weather?.current?.temperature || 25
  // Try to use hourly humidity if available
  const hourlyHumidity = weather?.hourly?.relative_humidity_2m
  const humidity = Array.isArray(hourlyHumidity) && hourlyHumidity.length ? average(hourlyHumidity) : (weather?.current?.humidity || 50)
  const windSpeed = weather?.current?.windSpeed || 5

  let riskScore = 0
  if (temperature > 35) riskScore += 40
  else if (temperature > 30) riskScore += 30
  else if (temperature > 25) riskScore += 20
  else riskScore += 10

  if (humidity < 20) riskScore += 40
  else if (humidity < 40) riskScore += 30
  else if (humidity < 60) riskScore += 20
  else riskScore += 10

  if (windSpeed > 30) riskScore += 20
  else if (windSpeed > 20) riskScore += 15
  else if (windSpeed > 10) riskScore += 10
  else riskScore += 5

  let level = 'Low'
  if (riskScore >= 80) level = 'Critical'
  else if (riskScore >= 60) level = 'High'
  else if (riskScore >= 40) level = 'Moderate'

  return { score: riskScore, level }
}

function average(arr = []) {
  if (!Array.isArray(arr) || arr.length === 0) return null
  const sum = arr.reduce((s, v) => s + (Number(v) || 0), 0)
  return sum / arr.length
}

module.exports = {
  getCurrentWeather,
  getForecast,
  getHistoricalWeather,
  getBulkWeather,
  calculateFireRisk
}
