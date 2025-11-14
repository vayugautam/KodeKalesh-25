/**
 * NASA FIRMS Integration Example
 * Demonstrates fetching and displaying VIIRS fire hotspot data
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  fetchFIRMSHotspots,
  filterByConfidence,
  getBrightnessColor,
  formatHotspotDisplay,
  FIRMS_API_CONFIG
} from '../utils/firmsApi'

export default function FIRMSIntegrationExample() {
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dayRange, setDayRange] = useState(1)
  const [minConfidence, setMinConfidence] = useState('nominal')
  const [filteredHotspots, setFilteredHotspots] = useState([])

  const loadHotspots = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchFIRMSHotspots({
        area: 'IND',
        dayRange: dayRange,
        source: FIRMS_API_CONFIG.SOURCES.VIIRS_SNPP
      })

      setHotspots(data)
      const filtered = filterByConfidence(data, minConfidence)
      setFilteredHotspots(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotspots()
  }, [])

  useEffect(() => {
    const filtered = filterByConfidence(hotspots, minConfidence)
    setFilteredHotspots(filtered)
  }, [minConfidence, hotspots])

  const getStats = () => {
    if (hotspots.length === 0) return null

    const brightnesses = hotspots
      .map(h => h.brightness)
      .filter(b => b !== null)

    const avgBrightness = brightnesses.length > 0
      ? (brightnesses.reduce((sum, b) => sum + b, 0) / brightnesses.length).toFixed(1)
      : 'N/A'

    const maxBrightness = brightnesses.length > 0
      ? Math.max(...brightnesses).toFixed(1)
      : 'N/A'

    const confCounts = {
      high: hotspots.filter(h => h.confidence === 'high').length,
      nominal: hotspots.filter(h => h.confidence === 'nominal').length,
      low: hotspots.filter(h => h.confidence === 'low').length
    }

    return { avgBrightness, maxBrightness, confCounts }
  }

  const stats = getStats()

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        NASA FIRMS VIIRS Fire Hotspot Integration
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>FIRMS (Fire Information for Resource Management System)</strong>
        <br />
        Provides near real-time fire detection data from NASA's VIIRS (Visible Infrared Imaging Radiometer Suite) satellite sensors.
        <br />
        Data is updated every 3 hours with a ~3-hour delay from actual detection time.
      </Alert>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={dayRange}
                label="Time Range"
                onChange={(e) => setDayRange(e.target.value)}
              >
                <MenuItem value={1}>Last 24 hours</MenuItem>
                <MenuItem value={2}>Last 48 hours</MenuItem>
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Min Confidence</InputLabel>
              <Select
                value={minConfidence}
                label="Min Confidence"
                onChange={(e) => setMinConfidence(e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="nominal">Nominal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={loadHotspots}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Refresh Data'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading FIRMS data: {error}
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Statistics
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="error.main">
                    {hotspots.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Hotspots
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {filteredHotspots.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Filtered ({minConfidence}+)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">
                    {stats.avgBrightness}K
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg Brightness
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="error.main">
                    {stats.maxBrightness}K
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max Brightness
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`High Confidence: ${stats.confCounts.high}`}
              sx={{ bgcolor: '#ff0000', color: 'white', fontWeight: 'bold' }}
            />
            <Chip
              label={`Nominal: ${stats.confCounts.nominal}`}
              sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 'bold' }}
            />
            <Chip
              label={`Low: ${stats.confCounts.low}`}
              sx={{ bgcolor: '#ffeb3b', color: 'black', fontWeight: 'bold' }}
            />
          </Box>
        </Paper>
      )}

      {/* Hotspots Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Detected Fire Hotspots ({filteredHotspots.length})
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading FIRMS data...
            </Typography>
          </Box>
        ) : filteredHotspots.length === 0 ? (
          <Alert severity="info">
            No hotspots found matching the selected criteria.
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Date/Time</strong></TableCell>
                  <TableCell><strong>Brightness</strong></TableCell>
                  <TableCell><strong>Confidence</strong></TableCell>
                  <TableCell><strong>FRP</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHotspots.slice(0, 50).map((hotspot) => {
                  const display = formatHotspotDisplay(hotspot)
                  return (
                    <TableRow key={hotspot.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {display.location}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {display.datetime}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={display.brightness}
                          size="small"
                          sx={{
                            bgcolor: display.color,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={display.confidence}
                          size="small"
                          sx={{
                            bgcolor: display.confidenceColor,
                            color: display.confidence === 'low' ? 'black' : 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {display.frp}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filteredHotspots.length > 50 && (
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            Showing first 50 of {filteredHotspots.length} hotspots
          </Typography>
        )}
      </Paper>

      {/* Data Information */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          📊 About the Data
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Source:</strong> NASA FIRMS VIIRS (Suomi NPP satellite)</li>
            <li><strong>Update Frequency:</strong> Every 3 hours</li>
            <li><strong>Detection Delay:</strong> ~3 hours from actual fire</li>
            <li><strong>Spatial Resolution:</strong> 375m at nadir</li>
            <li><strong>Brightness:</strong> Measured in Kelvin (K), indicates fire intensity</li>
            <li><strong>Confidence:</strong> Algorithm confidence in fire detection</li>
            <li><strong>FRP:</strong> Fire Radiative Power in Megawatts (MW)</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  )
}
