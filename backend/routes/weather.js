const express = require('express')
const router = express.Router()
const openMeteo = require('../openMeteo')


router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' })
    const weather = await openMeteo.getCurrentWeather(Number(lat), Number(lon))
    const risk = openMeteo.calculateFireRisk(weather)
    res.json({ weather, risk })
  } catch (err) {
    console.error(err.message || err)
    res.status(500).json({ error: 'Failed to fetch current weather' })
  }
})

router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, days } = req.query
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' })
    const data = await openMeteo.getForecast(Number(lat), Number(lon), Number(days) || 7)
    res.json(data)
  } catch (err) {
    console.error(err.message || err)
    res.status(500).json({ error: 'Failed to fetch forecast' })
  }
})


router.post('/bulk', async (req, res) => {
  try {
    const { locations } = req.body
    if (!Array.isArray(locations)) return res.status(400).json({ error: 'locations array required' })
    const results = await openMeteo.getBulkWeather(locations)
    res.json(results)
  } catch (err) {
    console.error(err.message || err)
    res.status(500).json({ error: 'Bulk weather failed' })
  }
})


router.get('/historical', async (req, res) => {
  try {
    const { lat, lon, startDate, endDate } = req.query
    if (!lat || !lon || !startDate || !endDate) return res.status(400).json({ error: 'lat, lon, startDate and endDate are required' })
    const data = await openMeteo.getHistoricalWeather(Number(lat), Number(lon), startDate, endDate)
    res.json(data)
  } catch (err) {
    console.error(err.message || err)
    res.status(500).json({ error: 'Failed to fetch historical data' })
  }
})

module.exports = router
