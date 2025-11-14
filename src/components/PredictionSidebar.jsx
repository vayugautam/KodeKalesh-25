/**
 * Collapsible Prediction Sidebar Component
 * 
 * Displays selected coordinates, weather data, prediction results,
 * and provides controls for updating predictions.
 * 
 * ML Model Integration:
 * @see https://github.com/ag21o9/ForestFireMLModel
 * Repository by ag21o9 - Forest Fire Prediction ML Model
 */

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  IconButton,
  Button,
  Stack,
  Collapse,
  Badge,
  Tooltip,
  CircularProgress,
  Fade,
  Zoom
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloseIcon from '@mui/icons-material/Close'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import OpacityIcon from '@mui/icons-material/Opacity'
import AirIcon from '@mui/icons-material/Air'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const PredictionSidebar = ({
  isOpen,
  onClose,
  locationData,
  weather,
  weatherLoading,
  weatherError,
  predictionResult,
  predictionLoading,
  onUpdatePrediction,
  lastUpdated
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [updateDisabled, setUpdateDisabled] = useState(false)

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  // Get risk level details based on bucket
  const getRiskDetails = (bucket) => {
    const riskLevels = {
      critical: { color: '#d32f2f', label: 'CRITICAL', icon: '🔴', bgColor: '#ffebee' },
      high: { color: '#ff9800', label: 'HIGH', icon: '🟠', bgColor: '#fff3e0' },
      medium: { color: '#fdd835', label: 'MEDIUM', icon: '🟡', bgColor: '#fffde7' },
      low: { color: '#66bb6a', label: 'LOW', icon: '🟢', bgColor: '#e8f5e9' },
      error: { color: '#757575', label: 'ERROR', icon: '⚠️', bgColor: '#f5f5f5' }
    }
    return riskLevels[bucket] || riskLevels.error
  }

  const riskDetails = predictionResult ? getRiskDetails(predictionResult.bucket) : null

  // Handle update button click
  const handleUpdate = async () => {
    if (updateDisabled || predictionLoading || weatherLoading) return
    
    setUpdateDisabled(true)
    await onUpdatePrediction()
    
    // Re-enable after 2 seconds to prevent spam
    setTimeout(() => setUpdateDisabled(false), 2000)
  }

  // Auto-collapse when window is small
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && !isCollapsed) {
        setIsCollapsed(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isCollapsed])

  if (!isOpen) return null

  return (
    <Fade in={isOpen} timeout={300}>
      <Paper
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: isCollapsed ? 60 : 420,
          zIndex: 1200,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 64
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <LocalFireDepartmentIcon />
            {!isCollapsed && (
              <Typography variant="h6" fontWeight={600} noWrap>
                Fire Prediction
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{ color: 'white' }}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
            {!isCollapsed && (
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'white' }}
                title="Close"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Collapse in={!isCollapsed} orientation="horizontal" timeout={300}>
          <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: 'calc(100vh - 64px)', p: 2 }}>
            {/* Location Section */}
            {locationData && (
              <Zoom in timeout={300}>
                <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Selected Location
                    </Typography>
                  </Box>
                  
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Grid Coordinates
                      </Typography>
                      <Typography variant="h6" fontFamily="monospace" color="primary.main">
                        X: {locationData.x}, Y: {locationData.y}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Geographic Position
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                        {locationData.lat.toFixed(6)}°N, {locationData.lng.toFixed(6)}°E
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cell Center
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                        {locationData.centerLat?.toFixed(6)}°N, {locationData.centerLon?.toFixed(6)}°E
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Zoom>
            )}

            {/* Weather Section */}
            <Zoom in timeout={400}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    🌤️ Weather Data
                  </Typography>
                </Box>

                {weatherLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={32} />
                  </Box>
                )}

                {weatherError && (
                  <Typography color="error" variant="body2">
                    ⚠️ {weatherError}
                  </Typography>
                )}

                {weather && !weatherLoading && (
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThermostatIcon color="error" />
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Temperature
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {weather.temp !== null ? `${weather.temp.toFixed(1)}°C` : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OpacityIcon color="info" />
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Relative Humidity
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {weather.RH !== null ? `${weather.RH}%` : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AirIcon color="primary" />
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Wind Speed
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {weather.wind !== null ? `${weather.wind.toFixed(1)} km/h` : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterDropIcon sx={{ color: '#1976d2' }} />
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Precipitation
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {weather.rain !== null ? `${weather.rain} mm` : '0 mm'}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                )}
              </Paper>
            </Zoom>

            {/* Prediction Result Section */}
            <Zoom in timeout={500}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2.5, 
                  mb: 2,
                  backgroundColor: riskDetails?.bgColor || '#f5f5f5',
                  border: `2px solid ${riskDetails?.color || '#ccc'}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalFireDepartmentIcon sx={{ color: riskDetails?.color || '#757575' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Fire Risk Prediction
                  </Typography>
                </Box>

                {predictionLoading && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary">
                      Analyzing fire risk...
                    </Typography>
                  </Box>
                )}

                {predictionResult && !predictionLoading && (
                  <Stack spacing={2}>
                    {/* Risk Level Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Chip
                        label={riskDetails.label}
                        icon={<span style={{ fontSize: '1.2rem' }}>{riskDetails.icon}</span>}
                        sx={{
                          backgroundColor: riskDetails.color,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          px: 2,
                          py: 2.5,
                          '& .MuiChip-icon': {
                            color: 'white'
                          }
                        }}
                      />
                    </Box>

                    {/* Prediction Score */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Prediction Score
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color={riskDetails.color}>
                        {predictionResult.score !== null && predictionResult.score !== undefined
                          ? predictionResult.score > 1 
                            ? predictionResult.score.toFixed(2) // Raw score if > 1
                            : `${(predictionResult.score * 100).toFixed(1)}%` // Percentage if 0-1
                          : 'N/A'}
                      </Typography>
                    </Box>

                    {/* Color Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Risk Color:
                      </Typography>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: predictionResult.color || '#999',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      />
                      <Typography variant="body2" fontFamily="monospace">
                        {predictionResult.color || '#999'}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Feature Values */}
                    {predictionResult.features_used && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                          Key Contributing Factors:
                        </Typography>
                        <Box sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.7)', 
                          p: 1.5, 
                          borderRadius: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {Array.isArray(predictionResult.features_used)
                              ? predictionResult.features_used.join(', ')
                              : typeof predictionResult.features_used === 'object'
                              ? Object.entries(predictionResult.features_used)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')
                              : String(predictionResult.features_used)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                )}

                {!predictionResult && !predictionLoading && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    Click on the map to get a prediction
                  </Typography>
                )}
              </Paper>
            </Zoom>

            {/* Update Controls */}
            <Zoom in timeout={600}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={updateDisabled || predictionLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                  onClick={handleUpdate}
                  disabled={updateDisabled || predictionLoading || weatherLoading || !locationData}
                  sx={{
                    mb: 1.5,
                    py: 1.2,
                    fontWeight: 600,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  {predictionLoading ? 'Updating...' : 'Update Prediction'}
                </Button>

                {/* Last Updated Timestamp */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {formatTimestamp(lastUpdated)}
                  </Typography>
                </Box>
              </Paper>
            </Zoom>

            {/* ML Model Attribution */}
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Powered by Forest Fire ML Model
              </Typography>
              <Typography variant="caption" color="primary" display="block" textAlign="center" sx={{ mt: 0.5 }}>
                <a 
                  href="https://github.com/ag21o9/ForestFireMLModel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  @ag21o9/ForestFireMLModel →
                </a>
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  )
}

PredictionSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  locationData: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    centerLat: PropTypes.number,
    centerLon: PropTypes.number
  }),
  weather: PropTypes.shape({
    temp: PropTypes.number,
    RH: PropTypes.number,
    wind: PropTypes.number,
    rain: PropTypes.number,
    weatherCode: PropTypes.number
  }),
  weatherLoading: PropTypes.bool,
  weatherError: PropTypes.string,
  predictionResult: PropTypes.shape({
    score: PropTypes.number,
    bucket: PropTypes.string,
    color: PropTypes.string,
    features_used: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ])
  }),
  predictionLoading: PropTypes.bool,
  onUpdatePrediction: PropTypes.func.isRequired,
  lastUpdated: PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(Date)])
}

export default PredictionSidebar
