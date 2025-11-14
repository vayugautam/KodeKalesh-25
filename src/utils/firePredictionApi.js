const DEFAULT_API_URL = 'https://forestfiremlmodel.onrender.com'

const INDIA_BOUNDS = {
  minLat: 5,
  maxLat: 37,
  minLon: 68,
  maxLon: 98,
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const round = (value, precision = 1) => Math.round(value * 10 ** precision) / 10 ** precision

export function deriveGridCell(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return { X: 5, Y: 5 }
  }

  const normalize = (value, min, max) => clamp((value - min) / (max - min || 1), 0, 1)
  const normalizedX = normalize(lon, INDIA_BOUNDS.minLon, INDIA_BOUNDS.maxLon)
  const normalizedY = normalize(lat, INDIA_BOUNDS.minLat, INDIA_BOUNDS.maxLat)

  return {
    X: clamp(Math.round(normalizedX * 8 + 1), 1, 9),
    Y: clamp(Math.round(normalizedY * 8 + 1), 1, 9),
  }
}

export function estimateFireIndexes({ temp, RH, wind, rain }) {
  const ffmc = clamp(75 + temp * 0.4 - RH * 0.3 + wind * 0.7 - rain * 3, 0, 101)
  const dmc = clamp(40 + temp * 0.6 - RH * 0.2 + wind * 0.4 - rain * 4, 0, 200)
  const dc = clamp(250 + temp * 1.3 - RH * 0.1 - rain * 12, 0, 800)
  const isi = clamp(4 + wind * 0.7 + (ffmc - 60) * 0.03, 0, 50)

  return {
    FFMC: round(ffmc, 1),
    DMC: round(dmc, 1),
    DC: round(dc, 1),
    ISI: round(isi, 1),
  }
}

function toMonthToken(date) {
  return date.toLocaleString('en', { month: 'short' }).slice(0, 3).toLowerCase()
}

function toDayToken(date) {
  return date.toLocaleString('en', { weekday: 'short' }).slice(0, 3).toLowerCase()
}

export function buildPredictionPayload({ location, weather, date = new Date() }) {
  const lat = location?.lat ?? location?.coordinates?.lat ?? location?.position?.[0]
  const lon = location?.lon ?? location?.coordinates?.lon ?? location?.position?.[1]
  const { X, Y } = deriveGridCell(lat, lon)

  const forecastDate = date instanceof Date ? date : new Date(date)
  const month = toMonthToken(forecastDate)
  const day = toDayToken(forecastDate)

  const temp = round(Number(weather?.temperature ?? weather?.temp ?? 30))
  const RH = clamp(round(Number(weather?.humidity ?? weather?.RH ?? 45)), 0, 100)
  const wind = round(Number(weather?.windSpeed ?? weather?.wind ?? 5))
  const rain = clamp(round(Number(weather?.precipitation ?? weather?.rain ?? 0), 2), 0, 50)

  const indexes = estimateFireIndexes({ temp, RH, wind, rain })

  return {
    X,
    Y,
    month,
    day,
    temp,
    RH,
    wind,
    rain,
    ...indexes,
  }
}

export async function requestFirePrediction(payload, { signal } = {}) {
  const apiUrl = import.meta.env.VITE_FIRE_MODEL_URL || DEFAULT_API_URL

  const response = await fetch(`${apiUrl}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Prediction API error')
  }

  const data = await response.json()
  return {
    ...data,
    score: data?.score ?? data?.prediction ?? 0,
    bucket: data?.bucket || data?.risk || 'Unknown',
    color: data?.color || '#ffa000',
    features_used: data?.features_used || payload,
  }
}

export default {
  deriveGridCell,
  estimateFireIndexes,
  buildPredictionPayload,
  requestFirePrediction,
}
