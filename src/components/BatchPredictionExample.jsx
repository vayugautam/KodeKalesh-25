/**
 * Batch Prediction Example Component
 * Demonstrates rectangle drawing and batch fire risk prediction
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { getGridCellsInBounds, batchPredictCells, calculatePredictionStats, groupPredictionsByRisk } from '../utils/batchPrediction'

export default function BatchPredictionExample() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)

  const runBatchExample = async () => {
    setLoading(true)
    setProgress({ completed: 0, total: 0 })

    // Example: Draw a rectangle over a region
    const exampleBounds = {
      north: 22.0,
      south: 21.0,
      east: 79.0,
      west: 78.0
    }

    // Get grid cells in bounds
    const cells = getGridCellsInBounds(exampleBounds, 1.0) // 1km grid

    console.log(`Found ${cells.length} cells`)
    setProgress({ completed: 0, total: cells.length })

    // Example weather data
    const weatherData = {
      temp: 35,
      RH: 30,
      wind: 20,
      rain: 0
    }

    // Run batch prediction
    const batchResult = await batchPredictCells(cells, weatherData, {
      concurrency: 3,
      onProgress: (prog) => {
        setProgress({
          completed: prog.completed,
          total: prog.total
        })
      },
      stopOnError: false
    })

    // Calculate statistics
    const stats = calculatePredictionStats(batchResult.predictions)
    const grouped = groupPredictionsByRisk(batchResult.predictions)

    setResults({
      ...batchResult,
      stats,
      grouped
    })

    setLoading(false)
    setProgress(null)
  }

  const getRiskColor = (bucket) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#d32f2f'
    }
    return colors[bucket] || '#999'
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Batch Fire Prediction - Rectangle Drawing
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Draw a rectangle on the map to analyze fire risk across multiple grid cells.
        The system will automatically:
        <ul>
          <li>Detect all grid cells within the rectangle</li>
          <li>Batch-call the fire prediction API for each cell</li>
          <li>Animate predictions as they complete</li>
          <li>Color-code each cell based on risk level</li>
        </ul>
      </Alert>

      {/* How to Use */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          How to Use
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Click the rectangle tool"
              secondary="Located in the top-left drawing toolbar"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Draw a rectangle on the map"
              secondary="Click and drag to define the region to analyze"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Watch predictions animate"
              secondary="Each grid cell will be colored as predictions complete"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Click cells for details"
              secondary="Click any colored cell to see prediction details"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="5. Delete to reset"
              secondary="Use the trash icon to clear and start over"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Example Results Display */}
      {loading && progress && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Processing {progress.total} grid cells...
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(progress.completed / progress.total) * 100}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {progress.completed} / {progress.total} completed
          </Typography>
        </Paper>
      )}

      {results && (
        <>
          {/* Summary Statistics */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Batch Results Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {results.summary.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Cells Analyzed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {results.summary.successful}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Successful Predictions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="error.main">
                      {results.summary.failed}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Failed Predictions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4">
                      {results.summary.successRate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Statistics */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prediction Statistics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {(parseFloat(results.stats.avgScore) * 100).toFixed(1)}%
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Maximum Score
                </Typography>
                <Typography variant="h5" fontWeight={600} color="error.main">
                  {(parseFloat(results.stats.maxScore) * 100).toFixed(1)}%
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Minimum Score
                </Typography>
                <Typography variant="h5" fontWeight={600} color="success.main">
                  {(parseFloat(results.stats.minScore) * 100).toFixed(1)}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Distribution */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Level Distribution
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              {Object.entries(results.stats.riskDistribution).map(([level, count]) => (
                <Chip
                  key={level}
                  label={`${level.toUpperCase()}: ${count}`}
                  sx={{
                    bgcolor: getRiskColor(level),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    py: 2,
                    px: 1
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Visual Distribution */}
            <Box>
              {Object.entries(results.stats.riskDistribution).map(([level, count]) => (
                <Box key={level} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={600}>
                      {level.toUpperCase()}
                    </Typography>
                    <Typography variant="caption">
                      {count} cells ({((count / results.stats.count) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / results.stats.count) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getRiskColor(level)
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Sample Predictions */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sample Predictions (First 5)
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {results.predictions.slice(0, 5).map((pred, idx) => (
                <Card key={idx} variant="outlined">
                  <CardContent sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Grid Cell ({pred.cell.x}, {pred.cell.y})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lat: {pred.cell.lat.toFixed(4)}°, Lon: {pred.cell.lon.toFixed(4)}°
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={pred.prediction.bucket?.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: pred.prediction.color || '#999',
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 0.5
                          }}
                        />
                        <Typography variant="caption" display="block">
                          Score: {(pred.prediction.score * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          💡 Performance Tips
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Keep rectangles small (&lt;100 cells) for faster results</li>
            <li>Predictions process in batches of 3 (configurable)</li>
            <li>Each batch has a 500ms delay to avoid overwhelming the API</li>
            <li>Failed predictions don't stop the batch process</li>
            <li>Click individual cells to see detailed prediction data</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  )
}
