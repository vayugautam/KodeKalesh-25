import { useState, useEffect, useRef } from 'react'
import { Box, CssBaseline, Snackbar, Alert, Fab, Tooltip, CircularProgress } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import MapView from '../components/MapView'
import ErrorBoundary from '../components/ErrorBoundary'
import RightSidebar from '../components/RightSidebar'
import WeatherInfoPanel from '../components/WeatherInfoPanel'
import { RightSidebarSkeleton } from '../components/LoadingSkeletons'
import { useLocations } from '../hooks/useLocations'
import { useRiskZones } from '../hooks/useRisk'
import { useOpenMeteoWeather } from '../hooks/useOpenMeteoWeather'
import { generatePDFReport, downloadScreenshot } from '../utils/pdfExport'
import { buildPredictionPayload, requestFirePrediction } from '../utils/firePredictionApi'

function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [timelineValue, setTimelineValue] = useState(0)
  const [timelinePrediction, setTimelinePrediction] = useState(null)
  const [modelPrediction, setModelPrediction] = useState(null)
  const [lastPredictionRequest, setLastPredictionRequest] = useState(null)
  const predictionAbortRef = useRef(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const mapContainerRef = useRef(null)
  
  // Fetch locations from API
  const { data: locations, loading: locationsLoading, error: locationsError } = useLocations()
  
  // Fetch risk zones from API
  const { data: riskZones, loading: riskLoading, error: riskError } = useRiskZones()

  // Fetch real weather data from Open-Meteo when location is selected
  const selectedLat = selectedLocation?.position?.[0] || null
  const selectedLon = selectedLocation?.position?.[1] || null
  const { 
    data: weatherData, 
    loading: weatherLoading, 
    error: weatherError 
  } = useOpenMeteoWeather(selectedLat, selectedLon, !!selectedLocation)

  // Handle initial load
  useEffect(() => {
    if (!locationsLoading && !riskLoading) {
      setTimeout(() => setIsInitialLoad(false), 500)
    }
  }, [locationsLoading, riskLoading])

  // Handle errors
  useEffect(() => {
    if (locationsError) {
      setErrorMessage(`Locations: ${locationsError}`)
    }
    if (riskError) {
      setErrorMessage(`Risk data: ${riskError}`)
    }
    if (weatherError) {
      console.warn('Weather API Error:', weatherError)
    }
  }, [locationsError, riskError, weatherError])

  // Log weather data when it updates
  useEffect(() => {
    if (weatherData) {
      console.log('Real-time Weather Data:', weatherData)
      console.log('Fire Risk Assessment:', weatherData.risk)
    }
  }, [weatherData])

  useEffect(() => {
    setTimelinePrediction(null)
    setModelPrediction(null)
    setLastPredictionRequest(null)
  }, [selectedLocation])

  useEffect(() => () => {
    predictionAbortRef.current?.abort()
  }, [])

  const handleCloseError = () => {
    setErrorMessage('')
  }

  const handleFetchPrediction = async () => {
    if (!selectedLocation || !weatherData?.current) {
      setErrorMessage('Select a location with weather data before requesting predictions.')
      return
    }

    if (predictionAbortRef.current) {
      predictionAbortRef.current.abort()
    }

    const controller = new AbortController()
    predictionAbortRef.current = controller

    try {
      const payload = buildPredictionPayload({
        location: selectedLocation,
        weather: {
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.windSpeed,
          rain: weatherData.daily?.precipitation_sum?.[0] ?? 0,
        },
        date: new Date().toISOString().split('T')[0],
      })

      setLastPredictionRequest(payload)
      const prediction = await requestFirePrediction(payload, { signal: controller.signal })
      setModelPrediction(prediction)
      setErrorMessage('')
    } catch (error) {
      if (error.name === 'AbortError') return
      console.error('Prediction API error:', error)
      setErrorMessage(error.message || 'Failed to fetch prediction')
    }
  }

  const handleTimelineChange = (time, prediction) => {
    setTimelineValue(time)
    setTimelinePrediction(prediction)
    console.log('Timeline changed to:', time, 'hours', prediction)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const result = await generatePDFReport(mapContainerRef.current, {
        selectedLocation,
        weatherData,
        riskScore: weatherData?.risk?.score || timelinePrediction?.risk || 72,
        timelineValue,
        currentPrediction: timelinePrediction,
      })
      
      if (result.success) {
        setErrorMessage('')
        // Show success message
        const successMsg = `PDF report "${result.fileName}" downloaded successfully!`
        console.log(successMsg)
      } else {
        setErrorMessage(`PDF export failed: ${result.error}`)
      }
    } catch (error) {
      setErrorMessage(`Export error: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleScreenshot = async () => {
    setIsExporting(true)
    try {
      const filename = `map-screenshot-${Date.now()}.png`
      const result = await downloadScreenshot(mapContainerRef.current, filename)
      
      if (result.success) {
        console.log('Screenshot saved:', result.filename)
      } else {
        setErrorMessage(`Screenshot failed: ${result.error}`)
      }
    } catch (error) {
      setErrorMessage(`Screenshot error: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
      <CssBaseline />
      
      {/* Main Map Container */}
      <Box 
        ref={mapContainerRef}
        sx={{ 
          flexGrow: 1, 
          position: 'relative',
          height: '100%',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <ErrorBoundary errorMessage="Map component failed to load. This may be due to clustering initialization.">
            <MapView 
              selectedLocation={selectedLocation}
              locations={locations}
              riskZones={riskZones}
              onLocationSelect={setSelectedLocation}
              timelineValue={timelineValue}
              currentPrediction={timelinePrediction}
            />
          </ErrorBoundary>
        </Box>
        
        {/* Weather Info Panel at the bottom */}
        <WeatherInfoPanel weatherData={weatherData} loading={weatherLoading} />

        {/* Export Buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 120,
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 1000,
          }}
        >
          <Tooltip title="Export PDF Report" placement="left">
            <Fab
              color="primary"
              size="medium"
              onClick={handleExportPDF}
              disabled={isExporting}
              sx={{
                boxShadow: 3,
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                }
              }}
            >
              {isExporting ? <CircularProgress size={24} color="inherit" /> : <PictureAsPdfIcon />}
            </Fab>
          </Tooltip>

          <Tooltip title="Screenshot Map" placement="left">
            <Fab
              color="secondary"
              size="medium"
              onClick={handleScreenshot}
              disabled={isExporting}
              sx={{
                boxShadow: 3,
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                }
              }}
            >
              {isExporting ? <CircularProgress size={24} color="inherit" /> : <CameraAltIcon />}
            </Fab>
          </Tooltip>
        </Box>
      </Box>

      {/* Right Sidebar for Predictions */}
      {isInitialLoad ? (
        <Box sx={{ width: 380, borderLeft: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
          <RightSidebarSkeleton />
        </Box>
      ) : (
        <RightSidebar 
          selectedLocation={selectedLocation}
          weatherData={weatherData}
          prediction={modelPrediction}
          lastRequest={lastPredictionRequest}
          onTimeChange={handleTimelineChange}
        />
      )}

      {/* Error Snackbar */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="warning" sx={{ width: '100%' }}>
          API Error: {errorMessage}. Using placeholder data.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MapPage
