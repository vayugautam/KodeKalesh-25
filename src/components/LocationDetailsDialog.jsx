import { useState, useEffect } from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Alert
} from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import AirIcon from '@mui/icons-material/Air'
import WarningIcon from '@mui/icons-material/Warning'
import { useWeather } from '../hooks/useWeather'
import { useRiskAssessment } from '../hooks/useRisk'

function LocationDetailsDialog({ location, open, onClose }) {
  const [weatherEnabled, setWeatherEnabled] = useState(false)
  const [riskEnabled, setRiskEnabled] = useState(false)

  // Fetch weather data
  const { 
    data: weatherData, 
    loading: weatherLoading, 
    error: weatherError 
  } = useWeather(location?.lat, location?.lon, weatherEnabled)

  // Fetch risk data
  const { 
    data: riskData, 
    loading: riskLoading, 
    error: riskError 
  } = useRiskAssessment(location?.lat, location?.lon, riskEnabled)

  useEffect(() => {
    if (open && location) {
      setWeatherEnabled(true)
      setRiskEnabled(true)
    } else {
      setWeatherEnabled(false)
      setRiskEnabled(false)
    }
  }, [open, location])

  if (!location) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {location.name}
        <Typography variant="body2" color="text.secondary">
          {location.region} Region
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Weather Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Weather Data
          </Typography>
          {weatherLoading ? (
            <CircularProgress size={24} />
          ) : weatherError ? (
            <Alert severity="error">Failed to load weather data</Alert>
          ) : weatherData ? (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ThermostatIcon color="error" />
                  <Typography variant="h6">{weatherData.temperature}°C</Typography>
                  <Typography variant="caption">Temperature</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <WaterDropIcon color="primary" />
                  <Typography variant="h6">{weatherData.humidity}%</Typography>
                  <Typography variant="caption">Humidity</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <AirIcon color="info" />
                  <Typography variant="h6">{weatherData.windSpeed} km/h</Typography>
                  <Typography variant="caption">Wind Speed</Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No weather data available</Alert>
          )}
        </Box>

        <Divider />

        {/* Risk Assessment Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Risk Assessment
          </Typography>
          {riskLoading ? (
            <CircularProgress size={24} />
          ) : riskError ? (
            <Alert severity="error">Failed to load risk data</Alert>
          ) : riskData ? (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<WarningIcon />}
                  label={`Risk Level: ${riskData.level}`}
                  color={
                    riskData.level === 'high' ? 'error' :
                    riskData.level === 'medium' ? 'warning' : 'success'
                  }
                />
              </Box>
              <Typography variant="body2" gutterBottom>
                {riskData.description || 'Risk assessment completed'}
              </Typography>
              {riskData.factors && riskData.factors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Risk Factors:</Typography>
                  {riskData.factors.map((factor, idx) => (
                    <Chip 
                      key={idx} 
                      label={factor} 
                      size="small" 
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">No risk data available</Alert>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default LocationDetailsDialog
