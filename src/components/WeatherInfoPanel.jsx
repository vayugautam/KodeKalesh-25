import { Paper, Box, Typography, Grid } from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import NavigationIcon from '@mui/icons-material/Navigation'
import TerrainIcon from '@mui/icons-material/Terrain'
import ForestIcon from '@mui/icons-material/Forest'

// Dummy data - will be replaced with API data
const WEATHER_DATA = {
  temperature: 28,
  humidity: 65,
  windDirection: 135, // degrees (0=North, 90=East, 180=South, 270=West)
  windSpeed: 12,
  slope: 15, // degrees
  vegetationType: 'Mixed Forest'
}

function WeatherInfoPanel({ data = WEATHER_DATA }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #e0e0e0',
        backdropFilter: 'blur(10px)',
        p: 2
      }}
    >
      <Grid container spacing={2}>
        {/* Temperature Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          >
            <Box
              sx={{
                bgcolor: '#fff3e0',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ThermostatIcon sx={{ color: '#f44336', fontSize: 28 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Temperature
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {data.temperature}°C
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Humidity Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          >
            <Box
              sx={{
                bgcolor: '#e3f2fd',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <WaterDropIcon sx={{ color: '#2196f3', fontSize: 28 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Humidity
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {data.humidity}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Wind Direction Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          >
            <Box
              sx={{
                bgcolor: '#f3e5f5',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <NavigationIcon 
                sx={{ 
                  color: '#9c27b0', 
                  fontSize: 28,
                  transform: `rotate(${data.windDirection}deg)`,
                  transition: 'transform 0.3s'
                }} 
              />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Wind
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {data.windSpeed} km/h
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {getWindDirection(data.windDirection)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Slope Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          >
            <Box
              sx={{
                bgcolor: '#fbe9e7',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TerrainIcon sx={{ color: '#ff5722', fontSize: 28 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Slope
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {data.slope}°
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {getSlopeCategory(data.slope)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Vegetation Type Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          >
            <Box
              sx={{
                bgcolor: '#e8f5e9',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ForestIcon sx={{ color: '#4caf50', fontSize: 28 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Vegetation
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2, fontSize: '0.9rem' }}>
                {data.vegetationType}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

// Helper function to get wind direction label
function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

// Helper function to categorize slope
function getSlopeCategory(degrees) {
  if (degrees < 5) return 'Gentle'
  if (degrees < 15) return 'Moderate'
  if (degrees < 30) return 'Steep'
  return 'Very Steep'
}

export default WeatherInfoPanel
