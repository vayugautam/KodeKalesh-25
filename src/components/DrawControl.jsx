/**
 * Custom Drawing Control for React-Leaflet
 * Wraps Leaflet.Draw for rectangle drawing
 */

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'

export function DrawControl({ onRectangleCreated, onRectangleDeleted }) {
  const map = useMap()
  const drawnItemsRef = useRef(null)
  const drawControlRef = useRef(null)

  useEffect(() => {
    if (!map) return

    // Initialize FeatureGroup to store drawn items
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)
    drawnItemsRef.current = drawnItems

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        rectangle: {
          shapeOptions: {
            color: '#2196f3',
            fillColor: '#2196f3',
            fillOpacity: 0.2,
            weight: 2
          }
        },
        polygon: false,
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: false
      }
    })

    map.addControl(drawControl)
    drawControlRef.current = drawControl

    // Event handlers
    const handleDrawCreated = (e) => {
      const layer = e.layer
      
      // Remove previous rectangles (only allow one at a time)
      drawnItems.clearLayers()
      
      // Add new rectangle
      drawnItems.addLayer(layer)

      if (onRectangleCreated) {
        onRectangleCreated(e)
      }
    }

    const handleDrawDeleted = (e) => {
      if (onRectangleDeleted) {
        onRectangleDeleted(e)
      }
    }

    map.on(L.Draw.Event.CREATED, handleDrawCreated)
    map.on(L.Draw.Event.DELETED, handleDrawDeleted)

    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated)
      map.off(L.Draw.Event.DELETED, handleDrawDeleted)
      
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }
      
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
      }
    }
  }, [map, onRectangleCreated, onRectangleDeleted])

  return null
}

export default DrawControl
