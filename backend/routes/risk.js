const express = require('express')
const router = express.Router()
const openMeteo = require('../openMeteo')
const locations = require('../data/locations.json')


router.get('/assessment', async (req, res) => {
  try {
    const { lat, lon } = req.query
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' })
    const weather = await openMeteo.getCurrentWeather(Number(lat), Number(lon))
    const risk = openMeteo.calculateFireRisk(weather)
    res.json({ risk, weather })
  } catch (err) {
    console.error(err.message || err)
    res.status(500).json({ error: 'Failed to compute risk' })
  }
})


router.get('/alerts', (req, res) => {
  const region = req.query.region || 'all'
 
  const alerts = [
    { id: 'A1', region: 'North', level: 'High', message: 'Dry conditions, elevated fire risk' },
    { id: 'A2', region: 'West', level: 'Moderate', message: 'Windy conditions expected' }
  ]
  res.json(alerts.filter(a => region === 'all' || a.region.toLowerCase() === region.toLowerCase()))
})


router.get('/zones', (req, res) => {
  const zones = locations.map(l => ({ id: l.id, name: l.name, region: l.region, center: [l.lat, l.lon], riskLevel: l.riskLevel }))
  res.json(zones)
})


router.get('/predictions', async (req, res) => {
  try {
    const { lat, lon, days } = req.query
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' })
    const forecast = await openMeteo.getForecast(Number(lat), Number(lon), Number(days) || 3)
    const daily = forecast.daily || {}
    const predictions = (daily.time || []).map((t, idx) => {
      const tempMax = daily.temperature_2m_max ? daily.temperature_2m_max[idx] : null
      const temp = tempMax || 25
      const score = Math.min(100, Math.round((temp / 40) * 100))
      return { date: t, score, level: score > 70 ? 'High' : score > 40 ? 'Moderate' : 'Low' }
    })
    res.json(predictions)
  } catch (err) {
    console.error(err.message || err)
    res.status(500).json({ error: 'Failed to fetch predictions' })
  }
})


router.get('/statistics', (req, res) => {
  res.json({ totalZones: locations.length, highRisk: locations.filter(l => l.riskLevel === 'high').length })
})


router.get('/fire-hotspots', (req, res) => {
  const hotspots = [
    { id: 1, lat: 22.7, lon: 88.3, intensity: 0.9 },
    { id: 2, lat: 19.07, lon: 72.88, intensity: 0.6 }
  ]
  res.json(hotspots)
})

module.exports = router
