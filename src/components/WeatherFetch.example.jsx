import { useState } from 'react'
import { Box, Paper, Typography, Button, Stack, Divider, CircularProgress, Alert } from '@mui/material'
import { useLocationWeather } from '../hooks/useLocationWeather'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import OpacityIcon from '@mui/icons-material/Opacity'
import AirIcon from '@mui/icons-material/Air'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import RefreshIcon from '@mui/icons-material/Refresh'
import LocationOnIcon from '@mui/icons-material/LocationOn'

/**
 * Example usage of useLocationWeather hook
 */
function WeatherFetchExample() {
  // Example locations
  const locations = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, x: 123, y: 456 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, x: 789, y: 234 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, x: 345, y: 678 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, x: 901, y: 567 },
  ]

  const [selectedLocation, setSelectedLocation] = useState(locations[0])
  
  // Use the custom hook
  const { weather, loading, error, refetch } = useLocationWeather(selectedLocation)

  return (
    <Box sx={{ p: 4, maxWidth: 900 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Location Weather Fetching
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Automatically fetch real-time weather when a location (X, Y) is selected
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Location Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select a Location
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {locations.map((loc) => (
            <Button
              key={loc.name}
              variant={selectedLocation?.name === loc.name ? 'contained' : 'outlined'}
              onClick={() => setSelectedLocation(loc)}
              startIcon={<LocationOnIcon />}
            >
              {loc.name}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Selected Location Info */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📍 {selectedLocation.name}
          </Typography>
          <Button
            size="small"
            onClick={refetch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          >
            Refresh
          </Button>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Grid Coordinates:</strong> X: {selectedLocation.x}, Y: {selectedLocation.y}
          </Typography>
          <Typography variant="body2">
            <strong>Lat/Lon:</strong> {selectedLocation.lat.toFixed(6)}°, {selectedLocation.lng.toFixed(6)}°
          </Typography>
        </Stack>
      </Paper>

      {/* Weather Data Display */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🌤️ Real-Time Weather Data
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Fetching weather data from Open-Meteo API...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {weather && !loading && (
          <Box>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Clean Data Object:
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}
              >
                {JSON.stringify(
                  {
                    temp: weather.temp,
                    RH: weather.RH,
                    wind: weather.wind,
                    rain: weather.rain
                  },
                  null,
                  2
                )}
              </Box>
            </Paper>

            <Stack spacing={2}>
              {/* Temperature */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'rgba(244, 67, 54, 0.05)',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'rgba(244, 67, 54, 0.2)'
                }}
              >
                <ThermostatIcon sx={{ fontSize: 32, color: '#f44336' }} />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Temperature
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {weather.temp !== null ? `${weather.temp.toFixed(1)}°C` : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Humidity */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'rgba(33, 150, 243, 0.05)',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'rgba(33, 150, 243, 0.2)'
                }}
              >
                <OpacityIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Relative Humidity (RH)
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {weather.RH !== null ? `${weather.RH}%` : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Wind Speed */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'rgba(96, 125, 139, 0.05)',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'rgba(96, 125, 139, 0.2)'
                }}
              >
                <AirIcon sx={{ fontSize: 32, color: '#607d8b' }} />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Wind Speed
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {weather.wind !== null ? `${weather.wind.toFixed(1)} km/h` : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Rainfall */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'rgba(76, 175, 80, 0.05)',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'rgba(76, 175, 80, 0.2)'
                }}
              >
                <WaterDropIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Rainfall
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {weather.rain !== null ? `${weather.rain} mm` : '0 mm'}
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="primary" fontWeight={600} display="block" mb={1}>
                Additional Data
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Timestamp:</strong> {new Date(weather.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Location:</strong> [{weather.location?.lat.toFixed(4)}, {weather.location?.lng.toFixed(4)}]
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Grid Cell:</strong> X: {weather.location?.x}, Y: {weather.location?.y}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* API Info */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ API Information
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Source:</strong> Open-Meteo API (free, no authentication required)
          </Typography>
          <Typography variant="body2">
            <strong>Endpoint:</strong> https://api.open-meteo.com/v1/forecast
          </Typography>
          <Typography variant="body2">
            <strong>Data Returned:</strong> {`{ temp, RH, wind, rain }`}
          </Typography>
          <Typography variant="body2">
            <strong>Units:</strong> °C (temp), % (RH), km/h (wind), mm (rain)
          </Typography>
          <Typography variant="body2">
            <strong>Update Frequency:</strong> Real-time on location change
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default WeatherFetchExample
