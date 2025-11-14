import { useState } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Stack, 
  Divider, 
  Alert,
  Chip,
  Grid
} from '@mui/material'
import {
  preparePayload,
  validatePayload,
  getMonthString,
  getDayString,
  formatPayload,
  PAYLOAD_EXAMPLE,
  PAYLOAD_SCHEMA
} from '../utils/payloadUtils'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import CodeIcon from '@mui/icons-material/Code'
import SendIcon from '@mui/icons-material/Send'

/**
 * Example usage of payload preparation utilities
 */
function PayloadPreparationExample() {
  const [result, setResult] = useState(null)

  // Example input data
  const exampleData = {
    X: 123,
    Y: 456,
    lat: 19.0760,
    lng: 72.8777,
    weather: {
      temp: 28.5,
      RH: 65,
      wind: 12.3,
      rain: 0
    }
  }

  // Invalid example (for testing validation)
  const invalidData = {
    X: 123.5, // Should be integer
    Y: 456,
    lat: 19.0760,
    lng: 72.8777,
    weather: {
      temp: 150, // Out of range
      RH: 105,   // Out of range (>100%)
      wind: -5,  // Negative wind
      rain: 'none' // Wrong type
    }
  }

  const handlePrepare = (data, isInvalid = false) => {
    const result = preparePayload(data)
    setResult({ ...result, isInvalid })
  }

  const currentMonth = getMonthString()
  const currentDay = getDayString()

  return (
    <Box sx={{ p: 4, maxWidth: 1200 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        API Payload Preparation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Transform location and weather data into API-compatible JSON payload with validation
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Current Date Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
          📅 Current Date Context
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip label={`Month: ${currentMonth}`} color="primary" variant="outlined" />
          <Chip label={`Day: ${currentDay}`} color="primary" variant="outlined" />
          <Chip label={new Date().toLocaleDateString()} variant="outlined" />
        </Stack>
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Payload Preparation
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => handlePrepare(exampleData)}
            startIcon={<SendIcon />}
          >
            Prepare Valid Payload
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handlePrepare(invalidData, true)}
            startIcon={<ErrorIcon />}
          >
            Test Invalid Data
          </Button>
        </Stack>
      </Paper>

      {/* Input Data Display */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              📥 Valid Input Example
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
              {JSON.stringify(exampleData, null, 2)}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              ❌ Invalid Input Example
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: '#ffebee',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            >
              {JSON.stringify(invalidData, null, 2)}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Result Display */}
      {result && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {result.valid ? (
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
            ) : (
              <ErrorIcon sx={{ color: 'error.main', fontSize: 32 }} />
            )}
            <Typography variant="h6">
              {result.valid ? '✅ Payload Valid' : '❌ Validation Failed'}
            </Typography>
          </Box>

          {result.valid && result.payload && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                📤 API Payload (Ready to Send)
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: '#e8f5e9',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  border: '2px solid',
                  borderColor: 'success.main'
                }}
              >
                {formatPayload(result.payload)}
              </Box>

              {result.metadata && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} mb={1}>
                    Metadata (not sent to API)
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="caption">
                      Original Lat: {result.metadata.originalLat?.toFixed(6)}°
                    </Typography>
                    <Typography variant="caption">
                      Original Lng: {result.metadata.originalLng?.toFixed(6)}°
                    </Typography>
                    <Typography variant="caption">
                      Timestamp: {result.metadata.timestamp}
                    </Typography>
                    <Typography variant="caption">
                      Source: {result.metadata.weatherSource}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          {!result.valid && result.errors && (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Validation Errors:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {result.errors.map((error, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{error}</Typography>
                    </li>
                  ))}
                </ul>
              </Alert>

              {result.payload && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Invalid Payload (for debugging):
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: '#ffebee',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      border: '1px solid',
                      borderColor: 'error.main'
                    }}
                  >
                    {formatPayload(result.payload)}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* API Schema Documentation */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          📋 API Schema Requirements
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: 'white',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.75rem',
            fontFamily: 'monospace'
          }}
        >
          {JSON.stringify(PAYLOAD_SCHEMA, null, 2)}
        </Box>
      </Paper>

      {/* Example Payload */}
      <Paper sx={{ p: 3, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CodeIcon color="primary" />
          <Typography variant="h6" color="primary">
            Example Valid Payload
          </Typography>
        </Box>
        <Box
          component="pre"
          sx={{
            bgcolor: 'white',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}
        >
          {formatPayload(PAYLOAD_EXAMPLE)}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          <strong>Field Descriptions:</strong>
        </Typography>
        <Stack spacing={0.5} mt={1}>
          <Typography variant="caption">
            • <strong>X, Y:</strong> Grid cell coordinates (integers)
          </Typography>
          <Typography variant="caption">
            • <strong>month:</strong> 3-letter month abbreviation (jan-dec)
          </Typography>
          <Typography variant="caption">
            • <strong>day:</strong> 3-letter day abbreviation (sun-sat)
          </Typography>
          <Typography variant="caption">
            • <strong>temp:</strong> Temperature in °C (-50 to 60)
          </Typography>
          <Typography variant="caption">
            • <strong>RH:</strong> Relative humidity in % (0-100)
          </Typography>
          <Typography variant="caption">
            • <strong>wind:</strong> Wind speed in km/h (0-200)
          </Typography>
          <Typography variant="caption">
            • <strong>rain:</strong> Rainfall in mm (≥0)
          </Typography>
        </Stack>
      </Paper>

      {/* Function Reference */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔧 Function Reference
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
              preparePayload({`{ X, Y, lat, lng, weather, date? }`})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Main function to prepare and validate API payload
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
              validatePayload(payload)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Validate an existing payload against schema
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
              getMonthString(date?)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Get current or specified month as 3-letter string
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
              getDayString(date?)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Get current or specified day as 3-letter string
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default PayloadPreparationExample
