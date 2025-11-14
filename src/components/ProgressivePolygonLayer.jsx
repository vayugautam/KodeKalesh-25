import PropTypes from 'prop-types'
import { memo, useMemo } from 'react'
import { Polygon, LayerGroup } from 'react-leaflet'

function ProgressivePolygonLayer({ frameData, colorLow = '#90caf9', colorHigh = '#1976d2', opacityLow = 0.4, opacityHigh = 0.75 }) {
  const { lowRes = [], highRes = [], isHighResReady } = frameData || {}

  const lowResElements = useMemo(
    () =>
      lowRes.map((polygon, idx) => (
        <Polygon key={`low-${idx}`} positions={polygon} pathOptions={{ color: colorLow, weight: 1, opacity: opacityLow, fillOpacity: opacityLow }} />
      )),
    [lowRes, colorLow, opacityLow]
  )

  const highResElements = useMemo(
    () =>
      isHighResReady
        ? highRes.map((polygon, idx) => (
            <Polygon key={`high-${idx}`} positions={polygon} pathOptions={{ color: colorHigh, weight: 1, opacity: opacityHigh, fillOpacity: opacityHigh }} />
          ))
        : null,
    [highRes, colorHigh, opacityHigh, isHighResReady]
  )

  return <LayerGroup>{highResElements || lowResElements}</LayerGroup>
}

ProgressivePolygonLayer.propTypes = {
  frameData: PropTypes.shape({
    lowRes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
    highRes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
    isHighResReady: PropTypes.bool,
  }),
  colorLow: PropTypes.string,
  colorHigh: PropTypes.string,
  opacityLow: PropTypes.number,
  opacityHigh: PropTypes.number,
}

export default memo(ProgressivePolygonLayer)
