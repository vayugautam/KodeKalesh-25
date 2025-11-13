import { useState, useEffect } from 'react'
import { Box, CssBaseline, Snackbar, Alert } from '@mui/material'
import MapView from '../components/MapView'
import Sidebar from '../components/Sidebar'
import RightSidebar from '../components/RightSidebar'
import WeatherInfoPanel from '../components/WeatherInfoPanel'
import { useLocations } from '../hooks/useLocations'
import { useRiskZones } from '../hooks/useRisk'

function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('India')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [timelineValue, setTimelineValue] = useState(0)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  
  // Fetch locations from API
  const { data: locations, loading: locationsLoading, error: locationsError } = useLocations()
  
  // Fetch risk zones from API
  const { data: riskZones, loading: riskLoading, error: riskError, refetch: refetchRiskZones } = useRiskZones()

  // Handle errors
  useEffect(() => {
    if (locationsError) {
      setErrorMessage(`Locations: ${locationsError}`)
    }
    if (riskError) {
      setErrorMessage(`Risk data: ${riskError}`)
    }
  }, [locationsError, riskError])

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

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Sidebar 
        onFetchPrediction={handleFetchPrediction}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      
      {/* Main Map Container */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative',
        height: '100vh',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
        <WeatherInfoPanel />
      </Box>

      {/* Right Sidebar for Predictions */}
      <RightSidebar 
        selectedLocation={selectedLocation} 
        onTimeChange={handleTimelineChange}
      />

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
