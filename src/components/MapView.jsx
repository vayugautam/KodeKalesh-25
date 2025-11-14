import PropTypes from 'prop-types'
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, LayersControl, useMap } from 'react-leaflet'
import SafeMarkerClusterGroup from './SafeMarkerClusterGroup'
import ProgressivePolygonLayer from './ProgressivePolygonLayer'
import 'leaflet/dist/leaflet.css'
import '../styles/markerCluster.css'
import '../styles/mapInteractions.css'
import L from 'leaflet'
import { Box, Typography, Chip, Paper, Divider, Stack, CircularProgress } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import WarningIcon from '@mui/icons-material/Warning'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import AirIcon from '@mui/icons-material/Air'
import Schedule from '@mui/icons-material/Schedule'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloudIcon from '@mui/icons-material/Cloud'
import OpacityIcon from '@mui/icons-material/Opacity'
import { useState, useEffect, useMemo, useRef } from 'react'
import 'leaflet.heat'
import { useHeatmapTransition } from '../hooks/useHeatmapTransition'
import { useSimulationPrefetch } from '../hooks/useSimulationPrefetch'
import { convertLatLonToXY, formatGridCoordinates, getGridCellBounds, GRID_CONFIG } from '../utils/gridUtils'
import { useLocationWeather } from '../hooks/useLocationWeather'
import { getWeatherDescription, calculateFireRisk } from '../utils/openMeteoApi'
import { preparePayload, formatPayload } from '../utils/payloadUtils'
import { callFirePredictionAPI } from '../utils/firePredictionClient'
import { getGridCellsInBounds, batchPredictCells, animatePredictions, calculatePredictionStats } from '../utils/batchPrediction'
import DrawControl from './DrawControl'
import 'leaflet-draw/dist/leaflet.draw.css'
import { fetchFIRMSHotspots, getBrightnessColor, formatHotspotDisplay } from '../utils/firmsApi'
import PredictionSidebar from './PredictionSidebar'
import { useToast } from '../hooks/useToast.jsx'

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

// Custom grid marker icon
const gridMarkerIcon = new L.DivIcon({
  className: 'custom-grid-marker',
  html: `<div style="
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    animation: markerDrop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  ">
    <span style="color: white; font-size: 16px; font-weight: bold;">📍</span>
  </div>
  <style>
    @keyframes markerDrop {
      0% { transform: translateY(-100px) scale(0); opacity: 0; }
      70% { transform: translateY(5px) scale(1.1); }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
  </style>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Custom cluster icon creator - dynamically sized based on cluster size
const createClusterCustomIcon = (cluster) => {
  const childCount = cluster.getChildCount()
  const markers = cluster.getAllChildMarkers()
  
  // Calculate average risk score for cluster
  const avgRisk = markers.reduce((sum, marker) => {
    const fire = FIRE_LOCATIONS.find(f => 
      f.position[0] === marker.getLatLng().lat && 
      f.position[1] === marker.getLatLng().lng
    )
    return sum + (fire?.riskScore || 0)
  }, 0) / childCount
  
  // Determine cluster color based on average risk
  let bgColor, borderColor, textColor
  if (avgRisk >= 0.7) {
    bgColor = 'rgba(244, 67, 54, 0.9)'    // High risk - red
    borderColor = '#d32f2f'
    textColor = '#fff'
  } else if (avgRisk >= 0.5) {
    bgColor = 'rgba(255, 152, 0, 0.9)'    // Medium risk - orange
    borderColor = '#f57c00'
    textColor = '#fff'
  } else {
    bgColor = 'rgba(255, 193, 7, 0.9)'    // Low risk - amber
    borderColor = '#ffa000'
    textColor = '#000'
  }
  
  // Size based on count
  const size = childCount < 10 ? 40 : childCount < 50 ? 50 : 60
  
  return L.divIcon({
    html: `
      <div style="
        background: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        animation: cluster-pulse 2s ease-in-out infinite;
        position: relative;
      ">
        <div style="
          font-size: ${size > 50 ? '18px' : '16px'};
          font-weight: bold;
          color: ${textColor};
          line-height: 1;
        ">${childCount}</div>
        <div style="
          font-size: 9px;
          color: ${textColor};
          opacity: 0.9;
          margin-top: 2px;
        ">hotspots</div>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size, true),
  })
}

// Create cluster popup content with top 3 hotspots sorted by risk
const createClusterPopupContent = (cluster) => {
  const markers = cluster.getAllChildMarkers()
  const childCount = markers.length
  
  // Get fire data for all markers and sort by risk score
  const fires = markers
    .map(marker => {
      return FIRE_LOCATIONS.find(f => 
        f.position[0] === marker.getLatLng().lat && 
        f.position[1] === marker.getLatLng().lng
      )
    })
    .filter(Boolean)
    .sort((a, b) => b.riskScore - a.riskScore)
  
  const top3 = fires.slice(0, 3)
  const avgRisk = fires.reduce((sum, f) => sum + f.riskScore, 0) / fires.length
  
  // Create HTML content
  const riskColor = avgRisk >= 0.7 ? '#f44336' : avgRisk >= 0.5 ? '#ff9800' : '#ffc107'
  
  return `
    <div style="min-width: 280px; padding: 16px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="font-size: 24px;">🔥</div>
        <div>
          <div style="font-weight: bold; font-size: 16px; color: #333;">Fire Cluster</div>
          <div style="font-size: 13px; color: #666;">${childCount} hotspot${childCount > 1 ? 's' : ''} detected</div>
        </div>
      </div>
      
      <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Average Risk Score</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 20px; font-weight: bold; color: ${riskColor};">
            ${(avgRisk * 100).toFixed(0)}%
          </div>
          <div style="
            font-size: 10px;
            padding: 4px 8px;
            border-radius: 12px;
            background: ${riskColor};
            color: white;
            font-weight: bold;
          ">
            ${avgRisk >= 0.7 ? 'HIGH' : avgRisk >= 0.5 ? 'MEDIUM' : 'LOW'}
          </div>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e0e0e0; padding-top: 12px;">
        <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px;">📊 Top 3 Hotspots by Risk</div>
        ${top3.map((fire, idx) => `
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: ${idx === 0 ? 'rgba(244,67,54,0.05)' : idx === 1 ? 'rgba(255,152,0,0.05)' : 'rgba(255,193,7,0.05)'};
            border-left: 3px solid ${idx === 0 ? '#f44336' : idx === 1 ? '#ff9800' : '#ffc107'};
            border-radius: 4px;
            margin-bottom: 6px;
          ">
            <div style="
              font-size: 16px;
              font-weight: bold;
              color: ${idx === 0 ? '#f44336' : idx === 1 ? '#ff9800' : '#ffc107'};
              min-width: 20px;
            ">#${idx + 1}</div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${fire.name}
              </div>
              <div style="font-size: 11px; color: #666; margin-top: 2px;">
                🌡️ ${fire.temperature}°C | 💧 ${fire.humidity}% | 💨 ${fire.windSpeed} km/h
              </div>
            </div>
            <div style="
              font-size: 14px;
              font-weight: bold;
              color: ${fire.riskScore >= 0.7 ? '#f44336' : fire.riskScore >= 0.5 ? '#ff9800' : '#ffc107'};
            ">${(fire.riskScore * 100).toFixed(0)}%</div>
          </div>
        `).join('')}
      </div>
      
      <div style="
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
        font-size: 11px;
        color: #999;
        text-align: center;
      ">
        💡 Zoom in to see individual markers
      </div>
    </div>
  `
}

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

// Map Click Handler Component
function MapClickHandler({ onMapClick, cellSizeKm }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !onMapClick) return

    const handleClick = (e) => {
      const { lat, lng } = e.latlng
      const gridData = convertLatLonToXY(lat, lng, cellSizeKm)
      const bounds = getGridCellBounds(gridData.x, gridData.y, cellSizeKm)
      
      onMapClick({
        x: gridData.x,
        y: gridData.y,
        lat,
        lng,
        centerLat: gridData.centerLat,
        centerLon: gridData.centerLon,
        gridLabel: formatGridCoordinates(gridData.x, gridData.y),
        bounds: {
          minLat: bounds.south,
          maxLat: bounds.north,
          minLon: bounds.west,
          maxLon: bounds.east
        }
      })
    }

    map.on('click', handleClick)

    return () => {
      map.off('click', handleClick)
    }
  }, [map, onMapClick, cellSizeKm])

  return null
}

MapClickHandler.propTypes = {
  onMapClick: PropTypes.func,
  cellSizeKm: PropTypes.number
}

// Tile Loading Tracker Component
function TileLoadingTracker({ onLoadStart, onLoadComplete }) {
  const map = useMap()
  const [tilesToLoad, setTilesToLoad] = useState(0)
  const [tilesLoaded, setTilesLoaded] = useState(0)

  useEffect(() => {
    if (!map) return

    const handleTileLoadStart = () => {
      setTilesToLoad(prev => prev + 1)
      if (onLoadStart) onLoadStart()
    }

    const handleTileLoad = () => {
      setTilesLoaded(prev => {
        const newLoaded = prev + 1
        return newLoaded
      })
    }

    const handleTileLoadError = () => {
      setTilesLoaded(prev => prev + 1)
    }

    map.on('tileloadstart', handleTileLoadStart)
    map.on('tileload', handleTileLoad)
    map.on('tileerror', handleTileLoadError)

    return () => {
      map.off('tileloadstart', handleTileLoadStart)
      map.off('tileload', handleTileLoad)
      map.off('tileerror', handleTileLoadError)
    }
  }, [map, onLoadStart])

  useEffect(() => {
    if (tilesToLoad > 0 && tilesLoaded >= tilesToLoad) {
      const timer = setTimeout(() => {
        if (onLoadComplete) onLoadComplete()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [tilesToLoad, tilesLoaded, onLoadComplete])

  return null
}

// Wrapper component to track heatmap transition state
function AnimatedHeatmapLayer({ points, timelineValue, onTransitionChange }) {
  const previousPointsRef = useRef(points)
  const map = useMap()
  const heatLayerRef = useRef(null)
  const oldHeatLayerRef = useRef(null)

  // Use animated transition hook
  const { currentData, isTransitioning, progress } = useHeatmapTransition(
    previousPointsRef.current,
    points,
    600,
    timelineValue
  )

  // Notify parent of transition state changes
  useEffect(() => {
    if (onTransitionChange) {
      onTransitionChange(isTransitioning)
    }
  }, [isTransitioning, onTransitionChange])

  useEffect(() => {
    if (!map || !currentData || currentData.length === 0) return

    try {
      // Calculate intensity multiplier based on timeline
      const intensityMultiplier = 1 + (timelineValue / 6) * 0.15
      const radiusIncrease = (timelineValue / 6) * 8

      // Create heatmap data with interpolated intensities and opacity
      const heatData = currentData.map(point => {
        // Use interpolated intensity if available, otherwise calculate
        const intensity = point._interpolatedIntensity !== undefined
          ? point._interpolatedIntensity
          : Math.min((point.riskScore || 0.5) * intensityMultiplier, 1.0)
        
        return [
          point.position[0],
          point.position[1],
          Math.min(intensity, 1.0)
        ]
      })

      // During transition, crossfade between old and new layers
      if (isTransitioning && progress < 1) {
        // Keep old layer visible during transition
        if (heatLayerRef.current && !oldHeatLayerRef.current) {
          oldHeatLayerRef.current = heatLayerRef.current
        }

        // Create new layer with opacity based on progress
        const newHeat = L.heatLayer(heatData, {
          radius: 40 + radiusIncrease,
          blur: 50 + (radiusIncrease * 0.5),
          maxZoom: 10,
          max: 1.0,
          gradient: {
            0.0: '#4caf50',
            0.5: '#ffd54f',
            0.7: '#ff9800',
            1.0: '#e57373'
          },
          minOpacity: 0.4 * progress, // Fade in
          maxOpacity: 0.8 * progress
        })

        // Add new layer safely
        if (map && newHeat) {
          newHeat.addTo(map)
          heatLayerRef.current = newHeat
        }

        // Fade out old layer
        if (oldHeatLayerRef.current && oldHeatLayerRef.current.setOptions) {
          const oldOpacity = 0.8 * (1 - progress)
          oldHeatLayerRef.current.setOptions({
            minOpacity: 0.4 * (1 - progress),
            maxOpacity: oldOpacity
          })

          // Remove old layer when fully faded
          if (progress >= 0.98 && map.hasLayer(oldHeatLayerRef.current)) {
            map.removeLayer(oldHeatLayerRef.current)
            oldHeatLayerRef.current = null
          }
        }
      } else {
        // No transition - normal update
        if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
          map.removeLayer(heatLayerRef.current)
        }
        if (oldHeatLayerRef.current && map.hasLayer(oldHeatLayerRef.current)) {
          map.removeLayer(oldHeatLayerRef.current)
          oldHeatLayerRef.current = null
        }

        const heat = L.heatLayer(heatData, {
          radius: 40 + radiusIncrease,
          blur: 50 + (radiusIncrease * 0.5),
          maxZoom: 10,
          max: 1.0,
          gradient: {
            0.0: '#4caf50',
            0.5: '#ffd54f',
            0.7: '#ff9800',
            1.0: '#e57373'
          },
          minOpacity: 0.4,
          maxOpacity: 0.8
        })

        if (map && heat) {
          heat.addTo(map)
          heatLayerRef.current = heat
        }
      }

      // Update previous points reference
      if (!isTransitioning) {
        previousPointsRef.current = points
      }
    } catch (error) {
      console.error('Error updating heatmap layer:', error)
    }

    return () => {
      try {
        if (heatLayerRef.current && map && map.hasLayer(heatLayerRef.current)) {
          map.removeLayer(heatLayerRef.current)
        }
        if (oldHeatLayerRef.current && map && map.hasLayer(oldHeatLayerRef.current)) {
          map.removeLayer(oldHeatLayerRef.current)
        }
      } catch (error) {
        // Layer already removed or map unmounted
        console.debug('Error removing heatmap layer:', error)
      }
    }
  }, [map, currentData, timelineValue, isTransitioning, progress, points])

  return null
}

// Heatmap Layer Component with Animated Transitions


function MapView({ selectedLocation, locations, riskZones, onLocationSelect, timelineValue = 0, currentPrediction, showDebugLayers = false }) {
  const defaultCenter = [22.5937, 78.9629] // Center of India
  const defaultZoom = 5
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [mapLoading, setMapLoading] = useState(true)
  const [tilesLoading, setTilesLoading] = useState(true)
  const [showAttribution, setShowAttribution] = useState(false)
  const [heatmapTransitioning, setHeatmapTransitioning] = useState(false)
  const [regionTooltip, setRegionTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const [clickedLocation, setClickedLocation] = useState(null)
  const [gridCellSize, setGridCellSize] = useState(GRID_CONFIG.CELL_SIZE_KM) // 1.0 km default

  // Fetch weather data for clicked location
  const { weather, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useLocationWeather(clickedLocation)
  
  // Prepare API payload when weather is available
  const [apiPayload, setApiPayload] = useState(null)
  const [predictionResult, setPredictionResult] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Toast notifications
  const { showError, showSuccess, showInfo, ToastComponent } = useToast()
  
  // Batch prediction state
  const [batchPredictions, setBatchPredictions] = useState([])
  const [batchProgress, setBatchProgress] = useState(null)
  const [animatingPredictions, setAnimatingPredictions] = useState(false)
  const [drawnRectangle, setDrawnRectangle] = useState(null)
  
  // FIRMS hotspot state
  const [firmsHotspots, setFirmsHotspots] = useState([])
  const [showFirmsHotspots, setShowFirmsHotspots] = useState(false)
  const [firmsLoading, setFirmsLoading] = useState(false)

  // Use API risk zones if available, otherwise use placeholder
  const displayRiskZones = riskZones || PLACEHOLDER_RISK_ZONES
  const displayLocations = locations || []
  const displayFireLocations = FIRE_LOCATIONS // Fire markers with dummy data

  const totalFrames = useMemo(() => Math.max(displayFireLocations.length * 4, 24), [displayFireLocations.length])

  const { currentFrameData } = useSimulationPrefetch({
    currentFrame: timelineValue,
    totalFrames,
    seedOffset: currentPrediction?.risk || 0,
  })

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

  // Map API color to risk level for grid cell styling
  const mapColorToRiskLevel = (color) => {
    if (!color) return 'medium'
    const colorLower = color.toLowerCase()
    if (colorLower.includes('green') || colorLower === '#4caf50' || colorLower === '#008000') return 'low'
    if (colorLower.includes('yellow') || colorLower === '#ffd54f' || colorLower === '#ffff00') return 'medium'
    if (colorLower.includes('red') || colorLower === '#e57373' || colorLower === '#ff0000' || colorLower === '#f44336') return 'high'
    return 'medium' // default
  }

  // Get grid cell style based on prediction result
  const getGridCellStyle = (predictionData) => {
    if (!predictionData || !predictionData.color) {
      // Default style when no prediction
      return {
        color: '#2196f3',
        fillColor: '#2196f3',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5, 5'
      }
    }

    const riskLevel = mapColorToRiskLevel(predictionData.color)
    const baseStyle = getZoneStyle(riskLevel)
    
    return {
      ...baseStyle,
      fillColor: predictionData.color,
      color: predictionData.color,
      fillOpacity: 0.6,
      weight: 3,
    }
  }

  const handleMapClick = (locationData) => {
    setClickedLocation(locationData)
    setSidebarOpen(true) // Open sidebar when location is clicked
    console.log('🎯 Step 1: User clicked map at:', locationData)
    console.log(`   Grid Cell: X=${locationData.x}, Y=${locationData.y}`)
    console.log(`   Center: ${locationData.centerLat.toFixed(6)}°, ${locationData.centerLon.toFixed(6)}°`)
    console.log('🔄 Step 2: Fetching weather data automatically...')
    showInfo('Location selected. Fetching weather data...')
  }

  // Handle rectangle drawn
  const handleRectangleCreated = async (e) => {
    const layer = e.layer
    const bounds = layer.getBounds()
    
    const rectangleBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    }

    setDrawnRectangle(rectangleBounds)
    console.log('Rectangle drawn:', rectangleBounds)

    // Get all grid cells in the rectangle
    const cells = getGridCellsInBounds(rectangleBounds, gridCellSize)
    console.log(`Found ${cells.length} grid cells in rectangle`)

    if (cells.length === 0) {
      console.warn('No grid cells found in rectangle')
      return
    }

    if (cells.length > 100) {
      console.warn('Too many cells (>100). Please draw a smaller rectangle.')
      return
    }

    // Use weather from clicked location or default
    const weatherToUse = weather || {
      temp: 30,
      RH: 50,
      wind: 10,
      rain: 0
    }

    // Start batch prediction
    setBatchProgress({ completed: 0, total: cells.length })
    const results = []

    try {
      const batchResult = await batchPredictCells(cells, weatherToUse, {
        concurrency: 3,
        onProgress: (progress) => {
          setBatchProgress({
            completed: progress.completed,
            total: progress.total
          })
          
          if (progress.result) {
            // Add prediction immediately for animation
            results.push({
              success: true,
              cell: progress.current,
              prediction: progress.result
            })
            setBatchPredictions(prev => [...prev, {
              cell: progress.current,
              prediction: progress.result
            }])
          }
        },
        stopOnError: false
      })

      console.log('Batch prediction complete:', batchResult.summary)
      
      // Calculate statistics
      const stats = calculatePredictionStats(batchResult.predictions)
      console.log('Prediction statistics:', stats)
      
      setBatchProgress(null)
    } catch (error) {
      console.error('Batch prediction error:', error)
      setBatchProgress(null)
    }
  }

  // Clear batch predictions when drawing deleted
  const handleRectangleDeleted = () => {
    setBatchPredictions([])
    setDrawnRectangle(null)
    setBatchProgress(null)
    console.log('Rectangle deleted, cleared predictions')
  }

  // Handle update prediction button click
  const handleUpdatePrediction = async () => {
    if (!clickedLocation) return
    
    console.log('🔄 Manual update requested')
    showInfo('Refreshing weather and prediction...')
    
    // Refetch weather data
    await refetchWeather()
    
    // The useEffect hooks will automatically trigger payload generation
    // and API call when weather updates
  }

  // Fetch FIRMS hotspots on mount
  useEffect(() => {
    const loadFIRMSData = async () => {
      setFirmsLoading(true)
      try {
        const hotspots = await fetchFIRMSHotspots({
          area: 'IND', // India
          dayRange: 1,  // Last 24 hours
          source: 'VIIRS_SNPP_NRT'
        })
        setFirmsHotspots(hotspots)
        console.log(`Loaded ${hotspots.length} FIRMS hotspots`)
      } catch (error) {
        console.error('Failed to load FIRMS data:', error)
      } finally {
        setFirmsLoading(false)
      }
    }
    
    loadFIRMSData()
  }, [])

  // Prepare API payload when weather data is available
  useEffect(() => {
    if (weather && clickedLocation) {
      const result = preparePayload({
        X: clickedLocation.x,
        Y: clickedLocation.y,
        lat: clickedLocation.lat,
        lng: clickedLocation.lng,
        weather: {
          temp: weather.temp,
          RH: weather.RH,
          wind: weather.wind,
          rain: weather.rain
        }
      })
      
      if (result.valid) {
        setApiPayload(result.payload)
        console.log('✅ Step 3: API Payload prepared:', result.payload)
      } else {
        console.error('Payload validation failed:', result.errors)
        setApiPayload(null)
      }
    } else {
      setApiPayload(null)
      setPredictionResult(null)
    }
  }, [weather, clickedLocation])

  // Auto-call fire prediction API when payload is ready
  useEffect(() => {
    const callAPI = async () => {
      if (!apiPayload) {
        setPredictionResult(null)
        return
      }

      console.log('🔄 Step 4: Calling Fire Prediction API...')
      setPredictionLoading(true)
      setPredictionResult(null)

      try {
        const response = await callFirePredictionAPI(apiPayload)
        console.log('✅ Step 4 Complete: API Response:', response)
        
        // Check if API call was successful
        if (response.success && response.data) {
          console.log('📊 Prediction Data:', {
            score: response.data.score,
            bucket: response.data.bucket,
            color: response.data.color
          })
          
          setPredictionResult({
            score: response.data.score,
            bucket: response.data.bucket,
            color: response.data.color,
            features_used: response.data.features_used
          })
          setLastUpdated(Date.now())
          showSuccess('Fire risk prediction updated successfully!')
        } else {
          // API returned an error
          const errorMsg = response.error?.message || 'Unknown error'
          console.error('❌ API Error:', response.error)
          showError('Prediction failed: ' + errorMsg)
          
          // Set fallback prediction with grey color
          setPredictionResult({
            score: null,
            bucket: 'error',
            color: '#9e9e9e',
            features_used: ['API Error: ' + errorMsg]
          })
          setLastUpdated(Date.now())
        }
      } catch (error) {
        console.error('❌ Step 4 Failed: API Error:', error)
        
        // Show error toast
        showError('Prediction failed: ' + error.message)
        
        // Set fallback prediction with grey color
        setPredictionResult({
          score: null,
          bucket: 'error',
          color: '#9e9e9e', // Grey color for error state
          features_used: ['API Error: ' + error.message]
        })
        setLastUpdated(Date.now())
      } finally {
        setPredictionLoading(false)
      }
    }

    callAPI()
  }, [apiPayload, showError, showSuccess])

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.8; }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .map-skeleton {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              #e0e0e0 0%,
              #f0f0f0 50%,
              #e0e0e0 100%
            );
            background-size: 2000px 100%;
            animation: shimmer 2s infinite linear;
            z-index: 1001;
          }
          .tile-loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1002;
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top-color: #1976d2;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .leaflet-control-layers {
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          }
          .leaflet-control-attribution {
            display: none;
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}
      </style>

      {/* Map Loading Skeleton */}
      {mapLoading && (
        <div className="map-skeleton" />
      )}

      {/* Tile Loading Spinner */}
      {tilesLoading && !mapLoading && (
        <div className="tile-loading-spinner">
          <div className="spinner" />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Loading map tiles...
          </Typography>
        </div>
      )}

      {/* Heatmap Transition Indicator */}
      {heatmapTransitioning && showHeatmap && (
        <Paper
          sx={{
            position: 'absolute',
            top: 80,
            right: 80,
            zIndex: 1000,
            px: 2,
            py: 1,
            bgcolor: 'rgba(25, 118, 210, 0.95)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'white',
              animation: 'pulse-dot 1.5s ease-in-out infinite'
            }}
          />
          <Typography variant="caption" fontWeight={500}>
            Transitioning heatmap...
          </Typography>
        </Paper>
      )}

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

      {/* Grid Cell Size Control */}
      <Paper
        sx={{
          position: 'absolute',
          top: 80,
          right: 80,
          zIndex: 1000,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'white',
          boxShadow: 2,
          minWidth: 180
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          Grid Cell Size
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0.5, 1.0, 2.0].map(size => (
            <Box
              key={size}
              component="button"
              onClick={() => setGridCellSize(size)}
              sx={{
                bgcolor: gridCellSize === size ? 'primary.main' : 'grey.200',
                color: gridCellSize === size ? 'white' : 'grey.700',
                border: 'none',
                borderRadius: 1,
                px: 1.5,
                py: 0.5,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: gridCellSize === size ? 'primary.dark' : 'grey.300'
                }
              }}
            >
              {size} km
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Clicked Location Info Panel */}
      {clickedLocation && (
        <Paper
          sx={{
            position: 'absolute',
            top: 160,
            right: 80,
            zIndex: 1000,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            boxShadow: 3,
            minWidth: 260,
            maxWidth: 320,
            borderLeft: 4,
            borderColor: 'primary.main',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary">
              🔥 Fire Prediction Pipeline
            </Typography>
            <Box
              component="button"
              onClick={() => {
                setClickedLocation(null)
                setPredictionResult(null)
                setApiPayload(null)
              }}
              sx={{
                bgcolor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'text.secondary',
                padding: 0,
                minWidth: 'auto',
                '&:hover': { color: 'error.main' }
              }}
              title="Clear selection"
            >
              ✕
            </Box>
          </Box>

          {/* Pipeline Progress Indicator */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                ✓
              </Box>
              <Typography variant="caption" fontWeight={600}>
                Step 1: Location Selected
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: weather && !weatherLoading ? 'success.main' : weatherLoading ? 'warning.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {weatherLoading ? '...' : weather ? '✓' : '○'}
              </Box>
              <Typography variant="caption" fontWeight={600}>
                Step 2: Weather Data {weatherLoading ? 'Loading...' : weather ? 'Ready' : 'Pending'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: apiPayload ? 'success.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {apiPayload ? '✓' : '○'}
              </Box>
              <Typography variant="caption" fontWeight={600}>
                Step 3: Payload {apiPayload ? 'Generated' : 'Pending'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: predictionResult && !predictionLoading ? 'success.main' : predictionLoading ? 'warning.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {predictionLoading ? '...' : predictionResult ? '✓' : '○'}
              </Box>
              <Typography variant="caption" fontWeight={600}>
                Step 4: ML Prediction {predictionLoading ? 'Loading...' : predictionResult ? 'Complete' : 'Pending'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: predictionResult ? 'success.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {predictionResult ? '✓' : '○'}
              </Box>
              <Typography variant="caption" fontWeight={600}>
                Step 5: Map Visualization {predictionResult ? 'Active' : 'Pending'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                ✓
              </Box>
              <Typography variant="caption" fontWeight={600}>
                Step 6: Details Panel (This Panel!)
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Grid Coordinates
            </Typography>
            <Typography variant="h6" fontWeight={700} fontFamily="monospace" color="primary.main">
              X: {clickedLocation.x}, Y: {clickedLocation.y}
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Click Position
            </Typography>
            <Typography variant="body2" fontSize="0.75rem" fontFamily="monospace">
              {clickedLocation.lat.toFixed(6)}°, {clickedLocation.lng.toFixed(6)}°
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Cell Center
            </Typography>
            <Typography variant="body2" fontSize="0.75rem" fontFamily="monospace">
              {clickedLocation.centerLat.toFixed(6)}°, {clickedLocation.centerLon.toFixed(6)}°
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Weather Data Section */}
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                🌤️ Real-Time Weather
              </Typography>
              {!weatherLoading && (
                <Box
                  component="button"
                  onClick={refetchWeather}
                  sx={{
                    bgcolor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'primary.main',
                    '&:hover': { color: 'primary.dark' }
                  }}
                  title="Refresh weather"
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
            </Box>
            
            {weatherLoading && (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Loading weather data...
                </Typography>
              </Box>
            )}

            {weatherError && (
              <Box sx={{ py: 1, px: 1.5, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                <Typography variant="caption" color="error.main">
                  ⚠️ {weatherError}
                </Typography>
              </Box>
            )}

            {weather && !weatherLoading && (
              <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThermostatIcon sx={{ fontSize: 18, color: '#f44336' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {weather.temp !== null ? `${weather.temp.toFixed(1)}°C` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Temperature
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OpacityIcon sx={{ fontSize: 18, color: '#2196f3' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {weather.RH !== null ? `${weather.RH}%` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Humidity
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AirIcon sx={{ fontSize: 18, color: '#607d8b' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {weather.wind !== null ? `${weather.wind.toFixed(1)} km/h` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wind Speed
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WaterDropIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {weather.rain !== null ? `${weather.rain} mm` : '0 mm'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rainfall
                    </Typography>
                  </Box>

                  {weather.weatherCode !== undefined && (
                    <Box sx={{ mt: 0.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CloudIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {getWeatherDescription(weather.weatherCode)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>
            )}
          </Box>

          {/* API Payload Section */}
          {apiPayload && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                  📤 API Payload (Ready to Send)
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: '#e8f5e9',
                    p: 1.5,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    border: '1px solid',
                    borderColor: 'success.main',
                    maxHeight: 200
                  }}
                >
                  {formatPayload(apiPayload)}
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Month: ${apiPayload.month}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem' }}
                  />
                  <Chip 
                    label={`Day: ${apiPayload.day}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem' }}
                  />
                </Box>
              </Box>
            </>
          )}

          <Divider sx={{ my: 1.5 }} />
          
          <Chip 
            label={`${gridCellSize} km × ${gridCellSize} km grid`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem', fontWeight: 600 }}
          />
          
          {/* FIRMS Hotspots Toggle */}
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={showFirmsHotspots ? '🔥 Hide NASA VIIRS Hotspots' : '🛰️ Show NASA VIIRS Hotspots'}
              size="small"
              color={showFirmsHotspots ? 'error' : 'default'}
              onClick={() => setShowFirmsHotspots(!showFirmsHotspots)}
              sx={{ 
                fontSize: '0.7rem', 
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 2
                }
              }}
            />
            {firmsLoading && (
              <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                Loading satellite data...
              </Typography>
            )}
            {showFirmsHotspots && !firmsLoading && (
              <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                {firmsHotspots.length} active fires detected (24h)
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Attribution Toggle Button */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          zIndex: 1000,
          p: 0.5,
          bgcolor: 'white',
          boxShadow: 1,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 2
          }
        }}
        onClick={() => setShowAttribution(!showAttribution)}
        title="Toggle attribution"
      >
        <Typography variant="caption" fontWeight={500} sx={{ px: 1, fontSize: '0.7rem' }}>
          ©
        </Typography>
      </Paper>

      {/* Batch Prediction Progress */}
      {batchProgress && (
        <Paper
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1002,
            p: 2,
            minWidth: 300,
            bgcolor: 'rgba(255,255,255,0.98)',
            boxShadow: 3,
            borderLeft: '4px solid #2196f3'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={32} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Analyzing Grid Cells...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {batchProgress.completed} / {batchProgress.total} completed
              </Typography>
              <Box 
                sx={{ 
                  mt: 1,
                  height: 6,
                  bgcolor: '#e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{
                    height: '100%',
                    bgcolor: '#2196f3',
                    width: `${(batchProgress.completed / batchProgress.total) * 100}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Region Hover Tooltip */}
      {regionTooltip.visible && (
        <Box
          className={`region-tooltip ${regionTooltip.visible ? 'visible' : ''}`}
          sx={{
            left: regionTooltip.x,
            top: regionTooltip.y,
          }}
        >
          {regionTooltip.content}
        </Box>
      )}

      {/* Attribution Panel */}
      {showAttribution && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 50,
            right: 10,
            zIndex: 1000,
            p: 2,
            maxWidth: 300,
            bgcolor: 'rgba(255,255,255,0.98)',
            boxShadow: 3
          }}
        >
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Map Attribution
          </Typography>
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
          </Typography>
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            © <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> (Satellite)
          </Typography>
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            © <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Stadia Maps</a> (Dark Mode)
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Tiles © Respective providers
          </Typography>
        </Paper>
      )}

      {/* Timeline Indicator */}
      {timelineValue > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            px: 3,
            py: 1.5,
            backgroundColor: 'rgba(25, 118, 210, 0.95)',
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Schedule sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, lineHeight: 1 }}>
              Prediction Timeline
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              +{timelineValue} Hours
            </Typography>
          </Box>
          {currentPrediction && (
            <>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />
              <Box>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, lineHeight: 1 }}>
                  Risk Level
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                  {currentPrediction.risk}%
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}

      <MapContainer
        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : defaultCenter}
        zoom={selectedLocation ? 8 : defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        whenReady={() => {
          setMapLoading(false)
          setTimeout(() => setTilesLoading(false), 1500)
        }}
      >
        {/* Map Click Handler */}
        <MapClickHandler onMapClick={handleMapClick} cellSizeKm={gridCellSize} />

        {/* Tile Loading Tracker */}
        <TileLoadingTracker 
          onLoadStart={() => setTilesLoading(true)}
          onLoadComplete={() => setTilesLoading(false)}
        />

        {/* Drawing Controls for Rectangle Selection */}
        <DrawControl
          onRectangleCreated={handleRectangleCreated}
          onRectangleDeleted={handleRectangleDeleted}
        />

        {/* Layer Control for different map styles */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={3}
              keepBuffer={2}
              updateWhenIdle={true}
              updateWhenZooming={false}
              updateInterval={200}
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              minZoom={3}
              keepBuffer={2}
              updateWhenIdle={true}
              updateWhenZooming={false}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
              minZoom={3}
              keepBuffer={2}
              updateWhenIdle={true}
              updateWhenZooming={false}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Dark Mode">
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              maxZoom={19}
              minZoom={3}
              keepBuffer={2}
              updateWhenIdle={true}
              updateWhenZooming={false}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Heatmap Layer - Animated transitions between risk layers */}
        {showHeatmap && (
          <>
            <AnimatedHeatmapLayer 
              points={[
                ...displayFireLocations,
                // Add prediction point to heatmap if available
                ...(predictionResult && clickedLocation ? [{
                  id: 'prediction-point',
                  position: [clickedLocation.centerLat, clickedLocation.centerLon],
                  riskScore: predictionResult.score || 0.5,
                  intensity: predictionResult.bucket === 'critical' ? 'high' : 
                            predictionResult.bucket === 'high' ? 'high' :
                            predictionResult.bucket === 'medium' ? 'medium' : 'low'
                }] : [])
              ]} 
              timelineValue={timelineValue}
              onTransitionChange={setHeatmapTransitioning}
            />
            {currentFrameData && (
              <ProgressivePolygonLayer frameData={currentFrameData} />
            )}
          </>
        )}

        {/* GREEN Risk Zones (Low Risk) */}
        {(displayRiskZones.green || []).map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={getZoneStyle('low')}
            eventHandlers={{
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({ weight: 3, fillOpacity: 0.6 });
                setRegionTooltip({
                  visible: true,
                  x: e.originalEvent.pageX,
                  y: e.originalEvent.pageY - 60,
                  content: `${zone.name} • Low Risk • Safe Zone`
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getZoneStyle('low'));
                setRegionTooltip({ visible: false, x: 0, y: 0, content: '' });
              },
              mousemove: (e) => {
                setRegionTooltip(prev => ({
                  ...prev,
                  x: e.originalEvent.pageX,
                  y: e.originalEvent.pageY - 60
                }));
              }
            }}
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
            eventHandlers={{
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({ weight: 3, fillOpacity: 0.7 });
                setRegionTooltip({
                  visible: true,
                  x: e.originalEvent.pageX,
                  y: e.originalEvent.pageY - 60,
                  content: `${zone.name} • Medium Risk • Monitor Conditions`
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getZoneStyle('medium'));
                setRegionTooltip({ visible: false, x: 0, y: 0, content: '' });
              },
              mousemove: (e) => {
                setRegionTooltip(prev => ({
                  ...prev,
                  x: e.originalEvent.pageX,
                  y: e.originalEvent.pageY - 60
                }));
              }
            }}
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
            eventHandlers={{
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({ weight: 3, fillOpacity: 0.8 });
                setRegionTooltip({
                  visible: true,
                  x: e.originalEvent.pageX,
                  y: e.originalEvent.pageY - 60,
                  content: `⚠️ ${zone.name} • High Risk • Extreme Caution`
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getZoneStyle('high'));
                setRegionTooltip({ visible: false, x: 0, y: 0, content: '' });
              },
              mousemove: (e) => {
                setRegionTooltip(prev => ({
                  ...prev,
                  x: e.originalEvent.pageX,
                  y: e.originalEvent.pageY - 60
                }));
              }
            }}
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

        {/* Fire Location Markers with clustering */}
        <SafeMarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          maxClusterRadius={60}
          disableClusteringAtZoom={12}
          spiderfyDistanceMultiplier={1.5}
          animate={true}
          animateAddingMarkers={true}
          polygonOptions={{
            fillColor: 'transparent',
            color: 'transparent'
          }}
          eventHandlers={{
            clustermouseover: (cluster) => {
              const popupContent = createClusterPopupContent(cluster.layer)
              cluster.layer.bindPopup(popupContent, {
                maxWidth: 320,
                className: 'cluster-popup'
              })
            },
            clusterclick: (cluster) => {
              const popupContent = createClusterPopupContent(cluster.layer)
              cluster.layer.bindPopup(popupContent, {
                maxWidth: 320,
                className: 'cluster-popup'
              }).openPopup()
            }
          }}
        >
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
        </SafeMarkerClusterGroup>

        {/* Batch Prediction Grid Cells */}
        {batchPredictions.map((item, idx) => (
          <Polygon
            key={`batch-cell-${item.cell.x}-${item.cell.y}`}
            positions={[
              [item.cell.bounds.minLat, item.cell.bounds.minLon],
              [item.cell.bounds.minLat, item.cell.bounds.maxLon],
              [item.cell.bounds.maxLat, item.cell.bounds.maxLon],
              [item.cell.bounds.maxLat, item.cell.bounds.minLon],
            ]}
            pathOptions={{
              color: item.prediction.color || '#999',
              fillColor: item.prediction.color || '#999',
              fillOpacity: 0.5,
              weight: 1.5,
            }}
          >
            <Popup maxWidth={250}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Grid Cell ({item.cell.x}, {item.cell.y})
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={item.prediction.bucket?.toUpperCase() || 'UNKNOWN'}
                    size="small"
                    sx={{
                      bgcolor: item.prediction.color || '#999',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Score:</strong> {item.prediction.score !== null 
                    ? (item.prediction.score * 100).toFixed(1) + '%' 
                    : 'N/A'}
                </Typography>
                
                <Typography variant="caption" display="block" color="text.secondary">
                  Lat: {item.cell.lat.toFixed(4)}°, Lon: {item.cell.lon.toFixed(4)}°
                </Typography>
              </Box>
            </Popup>
          </Polygon>
        ))}

        {/* Clicked Grid Cell Rectangle - colored based on API prediction */}
        {clickedLocation && (
          <>
            <Polygon
              positions={[
                [clickedLocation.bounds.minLat, clickedLocation.bounds.minLon],
                [clickedLocation.bounds.minLat, clickedLocation.bounds.maxLon],
                [clickedLocation.bounds.maxLat, clickedLocation.bounds.maxLon],
                [clickedLocation.bounds.maxLat, clickedLocation.bounds.minLon],
              ]}
              pathOptions={getGridCellStyle(predictionResult)}
            />
            
            {/* Clicked Grid Location Marker */}
            <Marker
              position={[clickedLocation.centerLat, clickedLocation.centerLon]}
              icon={gridMarkerIcon}
            >
            <Popup maxWidth={300}>
              <Box sx={{ minWidth: 260 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📍 Selected Location
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Grid Coordinates
                  </Typography>
                  <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                    {clickedLocation.gridLabel}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    X: {clickedLocation.x} | Y: {clickedLocation.y}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Click Coordinates
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                    Lat: {clickedLocation.lat.toFixed(6)}°
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                    Lon: {clickedLocation.lng.toFixed(6)}°
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Grid Cell Center
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                    Lat: {clickedLocation.centerLat.toFixed(6)}°
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                    Lon: {clickedLocation.centerLon.toFixed(6)}°
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Fire Prediction Result */}
                {predictionLoading && (
                  <Box sx={{ mb: 1.5, textAlign: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                      Analyzing fire risk...
                    </Typography>
                  </Box>
                )}

                {predictionResult && !predictionLoading && (
                  <Box sx={{ mb: 1.5, bgcolor: predictionResult.color || '#f5f5f5', p: 1.5, borderRadius: 1, border: `2px solid ${predictionResult.color || '#ccc'}` }}>
                    <Typography variant="caption" fontWeight={700} display="block" mb={0.5} color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      🔥 FIRE RISK PREDICTION
                    </Typography>
                    
                    <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 0.5, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Risk Level:
                        </Typography>
                        <Chip
                          label={predictionResult.bucket ? predictionResult.bucket.toUpperCase() : 'UNKNOWN'}
                          size="small"
                          sx={{
                            bgcolor: predictionResult.color || '#999',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Prediction Score:
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {predictionResult.score !== null && predictionResult.score !== undefined 
                            ? (predictionResult.score * 100).toFixed(1) + '%' 
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {predictionResult.features_used && (
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.9)', p: 0.75, borderRadius: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.25}>
                          Key Factors:
                        </Typography>
                        <Typography variant="caption" fontSize="0.65rem" sx={{ lineHeight: 1.3 }}>
                          {Array.isArray(predictionResult.features_used)
                            ? predictionResult.features_used.join(', ')
                            : typeof predictionResult.features_used === 'object'
                            ? Object.entries(predictionResult.features_used).map(([k, v]) => `${k}: ${v}`).join(', ')
                            : String(predictionResult.features_used)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Weather Data in Popup */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                    🌤️ Current Weather
                  </Typography>
                  
                  {weatherLoading && (
                    <Typography variant="caption" color="text.secondary">
                      Loading...
                    </Typography>
                  )}

                  {weatherError && (
                    <Typography variant="caption" color="error.main" fontSize="0.7rem">
                      ⚠️ Error loading weather
                    </Typography>
                  )}

                  {weather && !weatherLoading && (
                    <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mt: 0.5 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          🌡️ <strong>{weather.temp !== null ? `${weather.temp.toFixed(1)}°C` : 'N/A'}</strong>
                        </Typography>
                        <Typography variant="caption">
                          💧 <strong>{weather.RH !== null ? `${weather.RH}%` : 'N/A'}</strong> RH
                        </Typography>
                        <Typography variant="caption">
                          💨 <strong>{weather.wind !== null ? `${weather.wind.toFixed(1)} km/h` : 'N/A'}</strong>
                        </Typography>
                        <Typography variant="caption">
                          ☔ <strong>{weather.rain !== null ? `${weather.rain} mm` : '0 mm'}</strong>
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 1 }} />
                <Chip 
                  label={`Grid Size: ${gridCellSize} km`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            </Popup>
          </Marker>
          </>
        )}

        {/* NASA FIRMS VIIRS Hotspots */}
        {showFirmsHotspots && firmsHotspots.map((hotspot) => {
          const displayData = formatHotspotDisplay(hotspot)
          return (
            <CircleMarker
              key={hotspot.id}
              center={hotspot.position}
              radius={6}
              pathOptions={{
                fillColor: displayData.color,
                fillOpacity: 0.8,
                color: '#fff',
                weight: 1
              }}
            >
              <Popup maxWidth={280}>
                <Box sx={{ minWidth: 240 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LocalFireDepartmentIcon sx={{ color: displayData.color, fontSize: 24 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      NASA VIIRS Fire Detection
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Location */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📍 Location
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                      {displayData.location}
                    </Typography>
                  </Box>

                  {/* Detection Time */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🕐 Detection Time
                    </Typography>
                    <Typography variant="body2" fontSize="0.8rem">
                      {displayData.datetime}
                    </Typography>
                  </Box>

                  {/* Brightness Temperature */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🌡️ Brightness Temperature
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color={displayData.color}>
                      {displayData.brightness}
                    </Typography>
                  </Box>

                  {/* Confidence Level */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      ✓ Confidence Level
                    </Typography>
                    <Chip
                      label={displayData.confidence.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: displayData.confidenceColor,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  {/* Fire Radiative Power */}
                  {hotspot.frp && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ⚡ Fire Radiative Power
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {displayData.frp}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary" display="block">
                    Source: NASA FIRMS VIIRS
                  </Typography>
                </Box>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Fire Hotspots - optional debug layer */}
        {showDebugLayers && PLACEHOLDER_FIRE_HOTSPOTS.map((hotspot) => (
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

        {/* Location Markers - optional debug layer */}
        {showDebugLayers && displayLocations.map((location) => (
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

      {/* Prediction Sidebar */}
      <PredictionSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        locationData={clickedLocation}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        predictionResult={predictionResult}
        predictionLoading={predictionLoading}
        onUpdatePrediction={handleUpdatePrediction}
        lastUpdated={lastUpdated}
      />

      {/* Toast Notifications */}
      <ToastComponent />
    </Box>
  )
}

const coordinateArrayShape = PropTypes.arrayOf(
  PropTypes.arrayOf(PropTypes.number)
)

const riskZoneShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  coordinates: coordinateArrayShape.isRequired,
  riskLevel: PropTypes.string,
  description: PropTypes.string,
})

const locationShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  region: PropTypes.string,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  riskLevel: PropTypes.string,
})

const heatmapPointShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  riskScore: PropTypes.number,
})

TileLoadingTracker.propTypes = {
  onLoadStart: PropTypes.func,
  onLoadComplete: PropTypes.func,
}

AnimatedHeatmapLayer.propTypes = {
  points: PropTypes.arrayOf(heatmapPointShape).isRequired,
  timelineValue: PropTypes.number,
  onTransitionChange: PropTypes.func,
}

MapView.propTypes = {
  selectedLocation: PropTypes.shape({
    name: PropTypes.string,
    region: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  locations: PropTypes.arrayOf(locationShape),
  riskZones: PropTypes.shape({
    green: PropTypes.arrayOf(riskZoneShape),
    yellow: PropTypes.arrayOf(riskZoneShape),
    red: PropTypes.arrayOf(riskZoneShape),
  }),
  onLocationSelect: PropTypes.func,
  timelineValue: PropTypes.number,
  currentPrediction: PropTypes.shape({
    risk: PropTypes.number,
    spread: PropTypes.string,
    direction: PropTypes.string,
  }),
  showDebugLayers: PropTypes.bool,
}

export default MapView
