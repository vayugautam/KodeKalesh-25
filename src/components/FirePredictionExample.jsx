/**
 * Fire Prediction API Client - Example Usage
 * Demonstrates how to use the callFirePredictionAPI function
 */

import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import {
  callFirePredictionAPI,
  callBatchFirePrediction,
  checkAPIHealth,
  formatAPIResponse,
  getRiskDescription,
  callWithRetry,
} from '../utils/firePredictionClient'

export default function FirePredictionExample() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [apiHealth, setApiHealth] = useState(null)

  // Example payload
  const [payload, setPayload] = useState({
    X: 5,
    Y: 4,
    month: 'aug',
    day: 'fri',
    temp: 32.5,
    RH: 45,
    wind: 15.2,
    rain: 0,
  })

  // Single prediction
  const handlePredict = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await callFirePredictionAPI(payload)
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: {
          type: 'EXCEPTION',
          message: error.message,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  // Prediction with retry
  const handlePredictWithRetry = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await callWithRetry(payload, 3)
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: {
          type: 'EXCEPTION',
          message: error.message,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  // Check API health
  const handleCheckHealth = async () => {
    setLoading(true)
    const health = await checkAPIHealth()
    setApiHealth(health)
    setLoading(false)
  }

  // Batch prediction example
  const handleBatchPredict = async () => {
    setLoading(true)
    setResult(null)

    const batchPayloads = [
      { X: 5, Y: 4, month: 'aug', day: 'fri', temp: 32, RH: 45, wind: 15, rain: 0 },
      { X: 6, Y: 5, month: 'sep', day: 'sat', temp: 28, RH: 60, wind: 10, rain: 5 },
      { X: 7, Y: 6, month: 'jul', day: 'sun', temp: 35, RH: 30, wind: 20, rain: 0 },
    ]

    try {
      const response = await callBatchFirePrediction(batchPayloads, {
        concurrency: 2,
        stopOnError: false,
      })
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: {
          type: 'EXCEPTION',
          message: error.message,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePayload = (field, value) => {
    setPayload(prev => ({ ...prev, [field]: value }))
  }

  const getRiskColor = (bucket) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#d32f2f',
      extreme: '#b71c1c',
    }
    return colors[bucket?.toLowerCase()] || '#999'
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Fire Prediction API Client - Examples
      </Typography>

      {/* API Health Check */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Health Check
        </Typography>
        <Button
          variant="outlined"
          onClick={handleCheckHealth}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Check API Status
        </Button>
        {apiHealth && (
          <Alert
            severity={apiHealth.available ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {apiHealth.message} (Status: {apiHealth.statusCode || 'N/A'})
          </Alert>
        )}
      </Paper>

      {/* Input Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prediction Parameters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField
              label="X Coordinate"
              type="number"
              fullWidth
              value={payload.X}
              onChange={(e) => updatePayload('X', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Y Coordinate"
              type="number"
              fullWidth
              value={payload.Y}
              onChange={(e) => updatePayload('Y', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Month (e.g., aug)"
              fullWidth
              value={payload.month}
              onChange={(e) => updatePayload('month', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Day (e.g., fri)"
              fullWidth
              value={payload.day}
              onChange={(e) => updatePayload('day', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Temperature (°C)"
              type="number"
              fullWidth
              value={payload.temp}
              onChange={(e) => updatePayload('temp', parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Humidity (%)"
              type="number"
              fullWidth
              value={payload.RH}
              onChange={(e) => updatePayload('RH', parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Wind (km/h)"
              type="number"
              fullWidth
              value={payload.wind}
              onChange={(e) => updatePayload('wind', parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Rain (mm)"
              type="number"
              fullWidth
              value={payload.rain}
              onChange={(e) => updatePayload('rain', parseFloat(e.target.value))}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handlePredict}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Predict Fire Risk'}
          </Button>
          <Button
            variant="outlined"
            onClick={handlePredictWithRetry}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Predict with Retry
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleBatchPredict}
            disabled={loading}
          >
            Test Batch Prediction (3 locations)
          </Button>
        </Box>
      </Paper>

      {/* Results Display */}
      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            API Response
          </Typography>

          {result.success && !result.results ? (
            /* Single prediction result */
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Prediction successful!
              </Alert>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ mr: 2 }}>
                      Risk Level:
                    </Typography>
                    <Chip
                      label={result.data.bucket?.toUpperCase() || 'UNKNOWN'}
                      sx={{
                        backgroundColor: getRiskColor(result.data.bucket),
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <Typography variant="body1" gutterBottom>
                    <strong>Score:</strong> {result.data.score?.toFixed(4) || 'N/A'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Color:</strong>{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        width: 20,
                        height: 20,
                        backgroundColor: result.data.color || '#999',
                        border: '1px solid #ccc',
                        verticalAlign: 'middle',
                        marginRight: 8,
                      }}
                    />
                    {result.data.color || 'N/A'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Description:</strong>{' '}
                    {getRiskDescription(result.data.bucket)}
                  </Typography>

                  {result.data.features_used && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Features Used:</strong>{' '}
                        {Array.isArray(result.data.features_used)
                          ? result.data.features_used.join(', ')
                          : JSON.stringify(result.data.features_used)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(result.data, null, 2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : result.results ? (
            /* Batch prediction results */
            <Box>
              <Alert
                severity={result.success ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                Batch prediction complete: {result.successRate} success rate
                ({result.results.length} successful, {result.errors.length} failed)
              </Alert>

              <Typography variant="body2" gutterBottom>
                Total processed: {result.totalProcessed} / {result.totalRequested}
              </Typography>

              {result.results.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Successful Predictions:
                  </Typography>
                  {result.results.map((item, idx) => (
                    <Card key={idx} sx={{ mb: 1, p: 1 }}>
                      <Typography variant="body2">
                        Location #{item.index + 1}: X={item.payload.X}, Y=
                        {item.payload.Y} →{' '}
                        <Chip
                          label={item.result.data.bucket}
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(item.result.data.bucket),
                            color: 'white',
                          }}
                        />
                      </Typography>
                    </Card>
                  ))}
                </Box>
              )}

              {result.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    Failed Predictions:
                  </Typography>
                  {result.errors.map((item, idx) => (
                    <Alert severity="error" key={idx} sx={{ mb: 1 }}>
                      Location #{item.index + 1}: {item.result.error.message}
                    </Alert>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            /* Error result */
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                {result.error.type}: {result.error.message}
              </Alert>
              {result.error.details && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                  <Typography variant="caption" component="pre">
                    {typeof result.error.details === 'string'
                      ? result.error.details
                      : JSON.stringify(result.error.details, null, 2)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
              Full Response:
            </Typography>
            <Typography variant="caption" component="pre">
              {JSON.stringify(result, null, 2)}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
