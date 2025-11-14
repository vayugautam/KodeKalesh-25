import { Box, Paper, Typography, Stack, Divider, Chip } from '@mui/material'
import { 
  convertLatLonToXY, 
  convertXYToLatLon, 
  getGridCellBounds,
  formatGridCoordinates,
  calculateDistance,
  GRID_CONFIG 
} from '../utils/gridUtils'

/**
 * Example usage and testing of grid conversion utilities
 */
function GridUtilsExample() {
  // Example coordinates (major Indian cities)
  const examples = [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 }
  ]

  const gridSizes = [0.5, 1.0, 2.0]

  return (
    <Box sx={{ p: 4, maxWidth: 1000 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Grid Conversion Utilities
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Convert lat/lon coordinates to grid cells (X, Y) and vice versa
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Configuration */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Grid Configuration
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Origin Point:</strong> {GRID_CONFIG.ORIGIN_LAT}°N, {GRID_CONFIG.ORIGIN_LON}°E
          </Typography>
          <Typography variant="body2">
            <strong>Default Cell Size:</strong> {GRID_CONFIG.CELL_SIZE_KM} km × {GRID_CONFIG.CELL_SIZE_KM} km
          </Typography>
          <Typography variant="body2">
            <strong>Conversion Factor:</strong> ~{GRID_CONFIG.KM_PER_DEGREE_LAT} km/degree latitude
          </Typography>
        </Stack>
      </Paper>

      {/* City Examples */}
      {gridSizes.map(cellSize => (
        <Paper key={cellSize} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grid Size: {cellSize} km × {cellSize} km
          </Typography>
          <Stack spacing={2}>
            {examples.map((city) => {
              const gridCoords = convertLatLonToXY(city.lat, city.lon, cellSize)
              const cellBounds = getGridCellBounds(gridCoords.x, gridCoords.y, cellSize)
              const backConverted = convertXYToLatLon(gridCoords.x, gridCoords.y, cellSize)
              const distanceError = calculateDistance(
                city.lat, city.lon,
                backConverted.lat, backConverted.lon
              )

              return (
                <Box
                  key={city.name}
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {city.name}
                    </Typography>
                    <Chip
                      label={formatGridCoordinates(gridCoords.x, gridCoords.y)}
                      size="small"
                      color="primary"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Stack>

                  <Stack spacing={1} sx={{ fontSize: '0.85rem' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Original Coordinates:
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {city.lat.toFixed(6)}°, {city.lon.toFixed(6)}°
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Grid Cell (X, Y):
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600} color="primary">
                        X: {gridCoords.x}, Y: {gridCoords.y}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cell Center:
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {gridCoords.centerLat.toFixed(6)}°, {gridCoords.centerLon.toFixed(6)}°
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cell Bounds:
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                        N: {cellBounds.north.toFixed(6)}° | S: {cellBounds.south.toFixed(6)}°
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                        E: {cellBounds.east.toFixed(6)}° | W: {cellBounds.west.toFixed(6)}°
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Reverse Conversion (X,Y → Lat,Lon):
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {backConverted.lat.toFixed(6)}°, {backConverted.lon.toFixed(6)}°
                      </Typography>
                      <Chip
                        label={`Error: ${distanceError.toFixed(3)} km`}
                        size="small"
                        color={distanceError < 0.5 ? 'success' : 'warning'}
                        variant="outlined"
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        </Paper>
      ))}

      {/* API Reference */}
      <Paper sx={{ p: 3, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
        <Typography variant="h6" gutterBottom color="primary">
          API Reference
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              convertLatLonToXY(lat, lon, cellSizeKm)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns: {`{ x, y, centerLat, centerLon }`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              convertXYToLatLon(x, y, cellSizeKm)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns: {`{ lat, lon }`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              getGridCellBounds(x, y, cellSizeKm)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns: {`{ north, south, east, west }`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              formatGridCoordinates(x, y)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns: string like "Grid[123, 456]"
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              calculateDistance(lat1, lon1, lat2, lon2)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns: distance in kilometers (Haversine formula)
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default GridUtilsExample
