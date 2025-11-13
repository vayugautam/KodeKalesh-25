import { useState, useEffect, useRef } from 'react'
import { Box, CssBaseline, Snackbar, Alert, Fab, Tooltip, CircularProgress } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import MapView from '../components/MapView'
import Sidebar from '../components/Sidebar'
import RightSidebar from '../components/RightSidebar'
import WeatherInfoPanel from '../components/WeatherInfoPanel'
import { SidebarSkeleton, RightSidebarSkeleton } from '../components/LoadingSkeletons'
import { useLocations } from '../hooks/useLocations'
import { useRiskZones } from '../hooks/useRisk'
import { useOpenMeteoWeather } from '../hooks/useOpenMeteoWeather'
import { generatePDFReport, downloadScreenshot } from '../utils/pdfExport'

function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('India')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [timelineValue, setTimelineValue] = useState(0)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const mapContainerRef = useRef(null)
  
  // Fetch locations from API
  const { data: locations, loading: locationsLoading, error: locationsError } = useLocations()
  
  // Fetch risk zones from API
  const { data: riskZones, loading: riskLoading, error: riskError, refetch: refetchRiskZones } = useRiskZones()

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

  const handleCloseError = () => {
    setErrorMessage('')
  }

  const handleFetchPrediction = () => {
    console.log('Fetching prediction for:', selectedRegion, 'on', selectedDate)
    // Refetch risk zones with new parameters
    refetchRiskZones()
    // You can add API call here to fetch prediction based on region and date
  }

  const handleTimelineChange = (time, prediction) => {
    setTimelineValue(time)
    setCurrentPrediction(prediction)
    console.log('Timeline changed to:', time, 'hours', prediction)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const result = await generatePDFReport(mapContainerRef.current, {
        selectedLocation,
        weatherData,
        riskScore: weatherData?.risk?.score || currentPrediction?.risk || 72,
        timelineValue,
        currentPrediction,
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
      
      {/* Left Sidebar */}
      {isInitialLoad ? (
        <Box sx={{ width: 400, borderRight: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <SidebarSkeleton />
        </Box>
      ) : (
        <Sidebar 
          onFetchPrediction={handleFetchPrediction}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}
      
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
          <MapView 
            selectedLocation={selectedLocation}
            locations={locations}
            riskZones={riskZones}
            loading={locationsLoading || riskLoading}
            selectedRegion={selectedRegion}
            onLocationSelect={setSelectedLocation}
            timelineValue={timelineValue}
            currentPrediction={currentPrediction}
          />
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
