import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, CircleMarker, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Box, Typography, Chip, IconButton, Paper, Divider } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import WarningIcon from '@mui/icons-material/Warning'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import AirIcon from '@mui/icons-material/Air'
import { useState, useEffect } from 'react'
import 'leaflet.heat'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom fire icon
const fireIcon = new L.DivIcon({
  className: 'custom-fire-icon',
  html: `<div style="
    background-color: #ff4444;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    animation: pulse 1.5s ease-in-out infinite;
  ">
    <span style="color: white; font-size: 14px;">🔥</span>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// Fire location markers with dummy data
const FIRE_LOCATIONS = [
  { 
    id: 'f1', 
    position: [23.5937, 78.9629], 
    name: 'Madhya Pradesh Fire Zone', 
    intensity: 'high',
    riskScore: 0.85,
    temperature: 45,
    humidity: 25,
    windSpeed: 18,
    coordinates: { lat: 23.5937, lon: 78.9629 }
  },
  { 
    id: 'f2', 
    position: [26.8467, 80.9462], 
    name: 'Uttar Pradesh Active Fire', 
    intensity: 'medium',
    riskScore: 0.62,
    temperature: 38,
    humidity: 35,
    windSpeed: 12,
    coordinates: { lat: 26.8467, lon: 80.9462 }
  },
  { 
    id: 'f3', 
    position: [21.1458, 79.0882], 
    name: 'Maharashtra Fire Hotspot', 
    intensity: 'high',
    riskScore: 0.92,
    temperature: 52,
    humidity: 18,
    windSpeed: 22,
    coordinates: { lat: 21.1458, lon: 79.0882 }
  },
  { 
    id: 'f4', 
    position: [24.5854, 73.7125], 
    name: 'Rajasthan Fire Alert', 
    intensity: 'low',
    riskScore: 0.42,
    temperature: 32,
    humidity: 45,
    windSpeed: 8,
    coordinates: { lat: 24.5854, lon: 73.7125 }
  },
  { 
    id: 'f5', 
    position: [22.9734, 78.6569], 
    name: 'Central India Fire', 
    intensity: 'high',
    riskScore: 0.78,
    temperature: 48,
    humidity: 22,
    windSpeed: 16,
    coordinates: { lat: 22.9734, lon: 78.6569 }
  },
  { 
    id: 'f6', 
    position: [19.7515, 75.7139], 
    name: 'Aurangabad Fire Zone', 
    intensity: 'medium',
    riskScore: 0.58,
    temperature: 41,
    humidity: 30,
    windSpeed: 14,
    coordinates: { lat: 19.7515, lon: 75.7139 }
  },
]

// Placeholder fire hotspots data
const PLACEHOLDER_FIRE_HOTSPOTS = [
  { 
    id: 1, 
    position: [23.5937, 78.9629], 
    name: 'Fire Hotspot 1', 
    intensity: 'high',
    temperature: 45,
    detectedAt: '2 hours ago'
  },
  { 
    id: 2, 
    position: [26.8467, 80.9462], 
    name: 'Fire Hotspot 2', 
    intensity: 'medium',
    temperature: 38,
    detectedAt: '5 hours ago'
  },
  { 
    id: 3, 
    position: [21.1458, 79.0882], 
    name: 'Fire Hotspot 3', 
    intensity: 'high',
    temperature: 52,
    detectedAt: '1 hour ago'
  },
  { 
    id: 4, 
    position: [24.5854, 73.7125], 
    name: 'Fire Hotspot 4', 
    intensity: 'low',
    temperature: 32,
    detectedAt: '8 hours ago'
  },
]

// Placeholder risk zones data
const PLACEHOLDER_RISK_ZONES = {
  green: [
    {
      id: 'green1',
      name: 'Safe Zone - South',
      coordinates: [
        [8.4875, 76.9490],
        [11.1271, 75.3704],
        [10.8505, 78.6903],
        [8.5241, 77.9321],
      ],
      riskLevel: 'low',
      description: 'Low risk area'
    },
  ],
  yellow: [
    {
      id: 'yellow1',
      name: 'Moderate Risk - West',
      coordinates: [
        [18.5204, 73.8567],
        [19.0760, 72.8777],
        [20.5937, 70.9629],
        [19.9975, 73.7898],
      ],
      riskLevel: 'medium',
      description: 'Moderate risk - Monitor conditions'
    },
    {
      id: 'yellow2',
      name: 'Moderate Risk - Central',
      coordinates: [
        [21.1458, 79.0882],
        [22.7196, 75.8577],
        [23.2599, 77.4126],
        [21.7679, 78.8718],
      ],
      riskLevel: 'medium',
      description: 'Moderate risk area'
    },
  ],
  red: [
    {
      id: 'red1',
      name: 'High Risk - North',
      coordinates: [
        [28.7041, 77.1025],
        [30.7333, 76.7794],
        [29.9457, 78.1642],
        [28.5355, 77.3910],
      ],
      riskLevel: 'high',
      description: 'High risk - Extreme caution required'
    },
    {
      id: 'red2',
      name: 'High Risk - East',
      coordinates: [
        [22.5726, 88.3639],
        [24.6340, 87.8492],
        [23.8103, 91.2868],
        [22.9868, 88.8826],
      ],
      riskLevel: 'high',
      description: 'High risk - Flooding possible'
    },
  ],
}

// Heatmap Layer Component
function HeatmapLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !points || points.length === 0) return

    // Create heatmap data
    const heatData = points.map(point => [
      point.position[0],
      point.position[1],
      point.riskScore || 0.5
    ])

    // Add heatmap layer
    const heat = L.heatLayer(heatData, {
      radius: 40,
      blur: 50,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: '#4caf50',
        0.5: '#ffd54f',
        0.7: '#ff9800',
        1.0: '#e57373'
      }
    }).addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [map, points])

  return null
}

function MapView({ selectedLocation, locations, riskZones, loading, selectedRegion, onLocationSelect }) {
  const defaultCenter = [22.5937, 78.9629] // Center of India
  const defaultZoom = 5
  const [showHeatmap, setShowHeatmap] = useState(true)

  // Use API risk zones if available, otherwise use placeholder
  const displayRiskZones = riskZones || PLACEHOLDER_RISK_ZONES
  const displayLocations = locations || []
  const displayFireLocations = FIRE_LOCATIONS // Fire markers with dummy data

  // Get zone color configuration to match the design
  const getZoneStyle = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return {
          color: '#4caf50',
          fillColor: '#4caf50',
          fillOpacity: 0.4,
          weight: 1
        }
      case 'medium':
        return {
          color: '#ffd54f',
          fillColor: '#ffd54f',
          fillOpacity: 0.5,
          weight: 1
        }
      case 'high':
        return {
          color: '#e57373',
          fillColor: '#e57373',
          fillOpacity: 0.6,
          weight: 1
        }
      default:
        return {
          color: '#9e9e9e',
          fillColor: '#9e9e9e',
          fillOpacity: 0.3,
          weight: 1
        }
    }
  }

  const getMarkerColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#f44336'
      case 'medium': return '#ff9800'
      case 'low': return '#4caf50'
      default: return '#2196f3'
    }
  }

  const getRiskScoreColor = (score) => {
    if (score >= 0.7) return 'error'
    if (score >= 0.5) return 'warning'
    return 'success'
  }

  const getRiskScoreLabel = (score) => {
    if (score >= 0.7) return 'High Risk'
    if (score >= 0.5) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.8; }
          }
          .leaflet-control-layers {
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          }
        `}
      </style>

      {/* Heatmap Toggle Control */}
      <Paper
        sx={{
          position: 'absolute',
          top: 20,
          right: 80,
          zIndex: 1000,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'white',
          boxShadow: 2
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          Heatmap Layer
        </Typography>
        <Box
          component="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          sx={{
            bgcolor: showHeatmap ? 'primary.main' : 'grey.300',
            color: showHeatmap ? 'white' : 'grey.700',
            border: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: showHeatmap ? 'primary.dark' : 'grey.400'
            }
          }}
        >
          {showHeatmap ? 'ON' : 'OFF'}
        </Box>
      </Paper>

      <MapContainer
        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : defaultCenter}
        zoom={selectedLocation ? 8 : defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* Layer Control for different map styles */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Dark Mode">
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Heatmap Layer */}
        {showHeatmap && <HeatmapLayer points={displayFireLocations} />}

        {/* GREEN Risk Zones (Low Risk) */}
        {(displayRiskZones.green || []).map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={getZoneStyle('low')}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                  {zone.name}
                </Typography>
                <Chip label="Low Risk" size="small" sx={{ mt: 1, bgcolor: '#4caf50', color: 'white' }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {zone.description}
                </Typography>
              </Box>
            </Popup>
          </Polygon>
        ))}

        {/* YELLOW Risk Zones (Medium Risk) */}
        {(displayRiskZones.yellow || []).map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={getZoneStyle('medium')}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#f9a825' }}>
                  {zone.name}
                </Typography>
                <Chip label="Medium Risk" size="small" sx={{ mt: 1, bgcolor: '#ffd54f', color: '#000' }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {zone.description}
                </Typography>
              </Box>
            </Popup>
          </Polygon>
        ))}

        {/* RED Risk Zones (High Risk) */}
        {(displayRiskZones.red || []).map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={getZoneStyle('high')}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                  {zone.name}
                </Typography>
                <Chip 
                  icon={<WarningIcon />}
                  label="High Risk" 
                  size="small" 
                  sx={{ mt: 1, bgcolor: '#e57373', color: 'white' }} 
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {zone.description}
                </Typography>
              </Box>
            </Popup>
          </Polygon>
        ))}

        {/* Fire Location Markers with detailed popups */}
        {displayFireLocations.map((fire) => (
          <Marker 
            key={fire.id} 
            position={fire.position}
            icon={fireIcon}
            eventHandlers={{
              click: () => {
                if (onLocationSelect) {
                  onLocationSelect(fire)
                }
              }
            }}
          >
            <Popup maxWidth={300}>
              <Box sx={{ minWidth: 250 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalFireDepartmentIcon sx={{ color: '#ff4444', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {fire.name}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Coordinates */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    📍 Coordinates
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    Lat: {fire.coordinates.lat.toFixed(4)}°
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    Lon: {fire.coordinates.lon.toFixed(4)}°
                  </Typography>
                </Box>

                {/* Risk Score */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ⚠️ Risk Assessment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h5" fontWeight="bold" color={getRiskScoreColor(fire.riskScore)}>
                      {(fire.riskScore * 100).toFixed(0)}%
                    </Typography>
                    <Chip 
                      label={getRiskScoreLabel(fire.riskScore)}
                      color={getRiskScoreColor(fire.riskScore)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Risk Score: {fire.riskScore.toFixed(2)} / 1.00
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Weather Data */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    🌤️ Weather Conditions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Temperature */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThermostatIcon sx={{ color: '#f44336', fontSize: 20 }} />
                      <Typography variant="body2">
                        <strong>Temperature:</strong> {fire.temperature}°C
                      </Typography>
                    </Box>

                    {/* Humidity */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterDropIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                      <Typography variant="body2">
                        <strong>Humidity:</strong> {fire.humidity}%
                      </Typography>
                    </Box>

                    {/* Wind Speed */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AirIcon sx={{ color: '#607d8b', fontSize: 20 }} />
                      <Typography variant="body2">
                        <strong>Wind Speed:</strong> {fire.windSpeed} km/h
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Intensity Badge */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Chip 
                    label={`${fire.intensity.toUpperCase()} INTENSITY`}
                    color={
                      fire.intensity === 'high' ? 'error' :
                      fire.intensity === 'medium' ? 'warning' : 'default'
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            </Popup>
          </Marker>
        ))}

        {/* Fire Hotspots - Hide by default, show only if needed */}
        {false && PLACEHOLDER_FIRE_HOTSPOTS.map((hotspot) => (
          <Marker 
            key={hotspot.id} 
            position={hotspot.position}
            icon={fireIcon}
          >
            <Popup>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocalFireDepartmentIcon color="error" />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {hotspot.name}
                  </Typography>
                </Box>
                <Chip 
                  label={`${hotspot.intensity.toUpperCase()} Intensity`} 
                  color={
                    hotspot.intensity === 'high' ? 'error' :
                    hotspot.intensity === 'medium' ? 'warning' : 'default'
                  }
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">
                  🌡️ Temperature: <strong>{hotspot.temperature}°C</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Detected: {hotspot.detectedAt}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}

        {/* Location Markers - Hide by default to match design */}
        {false && displayLocations.map((location) => (
          <CircleMarker
            key={location.id}
            center={[location.lat, location.lon]}
            radius={8}
            pathOptions={{
              color: getMarkerColor(location.riskLevel),
              fillColor: getMarkerColor(location.riskLevel),
              fillOpacity: 0.8,
              weight: 2
            }}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {location.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {location.region} Region
                </Typography>
                {location.riskLevel && (
                  <Chip 
                    label={`${location.riskLevel} risk`}
                    color={
                      location.riskLevel === 'high' ? 'error' :
                      location.riskLevel === 'medium' ? 'warning' : 'success'
                    }
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </Box>
  )
}

export default MapView
