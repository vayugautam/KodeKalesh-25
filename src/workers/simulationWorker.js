/*
 * Web Worker for simulation frame computation.
 * Receives messages with { frameIndex, payload } and responds with
 * { frameIndex, polygonsLowRes, polygonsHighRes, metadata }.
 */
self.onmessage = async event => {
  const { frameIndex, payload } = event.data || {}
  if (typeof frameIndex !== 'number') {
    self.postMessage({ frameIndex: -1, error: 'Invalid frame index' })
    return
  }

  try {
    const result = await computeSimulationFrame(frameIndex, payload)
    self.postMessage({ frameIndex, ...result })
  } catch (error) {
    self.postMessage({ frameIndex, error: error?.message || 'Simulation failed' })
  }
}

function computeSimulationFrame(frameIndex, payload) {
  // Placeholder: simulate heavy computation
  const seed = frameIndex + (payload?.seedOffset || 0)
  const lowRes = generatePolygons(seed, 8)
  const highRes = generatePolygons(seed, 24)

  return Promise.resolve({
    polygonsLowRes: lowRes,
    polygonsHighRes: highRes,
    metadata: {
      computedAt: Date.now(),
      seed,
    },
  })
}

function generatePolygons(seed, segments) {
  const polygons = []
  for (let i = 0; i < 5; i += 1) {
    const radius = 0.5 + ((seed + i) % 10) * 0.05
    const polygon = []
    for (let j = 0; j < segments; j += 1) {
      const angle = (j / segments) * Math.PI * 2
      polygon.push([
        20 + radius * Math.cos(angle) + Math.sin(seed + i),
        78 + radius * Math.sin(angle) + Math.cos(seed + i * 0.5),
      ])
    }
    polygons.push(polygon)
  }
  return polygons
}
