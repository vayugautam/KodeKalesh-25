const express = require('express')
const router = express.Router()
const locations = require('../data/locations.json')


router.get('/', (req, res) => {
  res.json(locations)
})


router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  const loc = locations.find(l => l.id === id)
  if (!loc) return res.status(404).json({ error: 'Location not found' })
  res.json(loc)
})


router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase()
  if (!q) return res.json([])
  const results = locations.filter(l => l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q))
  res.json(results)
})

module.exports = router
