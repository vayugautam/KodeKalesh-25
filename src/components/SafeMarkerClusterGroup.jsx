import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

/**
 * StrictMode-friendly wrapper for MarkerClusterGroup.
 * React 18 mounts, unmounts, and remounts components in dev.
 * We defer rendering the cluster until after the first effect tick so the
 * underlying Leaflet instance only initializes once per real mount.
 */
export default function SafeMarkerClusterGroup({ children, ...props }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let frame = requestAnimationFrame(() => setIsReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <MarkerClusterGroup {...props}>
      {children}
    </MarkerClusterGroup>
  )
}

SafeMarkerClusterGroup.propTypes = {
  children: PropTypes.node,
}