import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Slider, IconButton, Tooltip, Typography, Chip } from '@mui/material'
import { PlayArrow, Pause, Replay } from '@mui/icons-material'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const DEFAULT_POINTS = [{ label: '00:00', value: 0 }]

function Timeline({
  points = DEFAULT_POINTS,
  initialIndex = 0,
  maxFps = 30,
  stepDuration = 1500,
  onTick,
  onSeek,
  label = 'Timeline',
}) {
  const timeline = useMemo(() => {
    if (!points.length) return DEFAULT_POINTS
    return points.map((point, index) => ({
      label: point.label ?? `${point.value ?? index}`,
      value: point.value ?? index,
      meta: point.meta ?? point,
    }))
  }, [points])

  const [index, setIndex] = useState(() => clamp(initialIndex, 0, timeline.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  const rafRef = useRef(null)
  const lastFrameRef = useRef(0)
  const elapsedRef = useRef(0)
  const sourceRef = useRef('manual')

  useEffect(() => {
    setIndex(clamp(initialIndex, 0, timeline.length - 1))
  }, [initialIndex, timeline.length])

  const currentPoint = timeline[index] || timeline[0]
  const marks = useMemo(
    () => timeline.map((point, idx) => ({ value: idx, label: point.label })),
    [timeline]
  )

  const frameInterval = useMemo(() => 1000 / Math.max(maxFps, 1), [maxFps])

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastFrameRef.current = 0
    elapsedRef.current = 0
  }, [])

  useEffect(() => {
    if (!isPlaying || timeline.length <= 1) {
      stopLoop()
      return
    }

    const loop = timestamp => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const delta = timestamp - lastFrameRef.current
      if (delta >= frameInterval) {
        lastFrameRef.current = timestamp
        elapsedRef.current += delta

        if (elapsedRef.current >= stepDuration) {
          elapsedRef.current -= stepDuration
          sourceRef.current = 'auto'
          setIndex(prev => (prev + 1) % timeline.length)
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return stopLoop
  }, [frameInterval, isPlaying, stepDuration, stopLoop, timeline.length])

  useEffect(() => {
    if (sourceRef.current === 'auto') {
      onTick?.(index)
      sourceRef.current = 'manual'
    }
  }, [index, onTick])

  const handleSeek = nextIndex => {
    const bounded = clamp(nextIndex, 0, timeline.length - 1)
    sourceRef.current = 'manual'
    setIndex(bounded)
    onSeek?.(bounded)
  }

  const handleSliderChange = (_, value) => {
    handleSeek(value)
  }

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev)
  }

  const handleRestart = () => {
    handleSeek(0)
  }

  const handleKeyDown = event => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleSeek(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handleSeek(index - 1)
    }
  }

  useEffect(() => () => stopLoop(), [stopLoop])

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight="bold">
          {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Restart">
            <span>
              <IconButton
                size="small"
                onClick={handleRestart}
                disabled={index === 0 && !isPlaying}
                aria-label="Restart timeline"
              >
                <Replay fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
            <IconButton
              size="small"
              onClick={handlePlayPause}
              color={isPlaying ? 'secondary' : 'primary'}
              aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Chip label={`Current: ${currentPoint.label}`} color="primary" variant="outlined" sx={{ width: 'fit-content' }} />

      <Box
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Timeline slider"
        sx={{ outline: 'none' }}
      >
        <Slider
          value={index}
          min={0}
          max={timeline.length - 1}
          step={1}
          marks={marks}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={value => timeline[value]?.label ?? value}
          sx={{
            '& .MuiSlider-thumb': { width: 18, height: 18 },
            '& .MuiSlider-track': { height: 6 },
            '& .MuiSlider-rail': { height: 6 },
            '& .MuiSlider-markLabel': { fontSize: '0.65rem' },
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          p: 1,
          backgroundColor: '#fafafa',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {isPlaying ? 'Playback running (30 fps max)' : 'Scrub or press play to animate'}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {currentPoint.label}
        </Typography>
      </Box>
    </Box>
  )
}

Timeline.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      meta: PropTypes.any,
    })
  ),
  initialIndex: PropTypes.number,
  maxFps: PropTypes.number,
  stepDuration: PropTypes.number,
  onTick: PropTypes.func,
  onSeek: PropTypes.func,
  label: PropTypes.string,
}

export default Timeline
