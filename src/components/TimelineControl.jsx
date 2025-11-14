import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Box, Slider, IconButton, Tooltip, Typography, Chip } from '@mui/material'
import { PlayArrow, Pause, Replay } from '@mui/icons-material'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * TimelineControl renders a discrete slider with play/pause controls, keyboard
 * scrubbing, and deterministic callbacks for playback and user seeks.
 */
export default function TimelineControl({
  timeline = [{ label: '0h', value: 0 }],
  initialIndex = 0,
  playInterval = 1600,
  fps = 30,
  onTick,
  onSeek,
}) {
  const normalizedTimeline = useMemo(() => {
    if (!timeline.length) {
      return [{ label: '0h', value: 0 }]
    }
    return timeline.map((point, index) => ({
      label: point.label ?? `${point.value ?? index}h`,
      value: point.value ?? index,
      meta: point.meta ?? point,
    }))
  }, [timeline])

  const [currentIndex, setCurrentIndex] = useState(() =>
    clamp(initialIndex, 0, normalizedTimeline.length - 1)
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const rafRef = useRef(null)
  const lastTimestampRef = useRef(0)
  const accumulationRef = useRef(0)
  const changeSourceRef = useRef('manual')

  useEffect(() => {
    setCurrentIndex(clamp(initialIndex, 0, normalizedTimeline.length - 1))
  }, [initialIndex, normalizedTimeline.length])

  const currentPoint = normalizedTimeline[currentIndex] || normalizedTimeline[0]
  const sliderMarks = useMemo(
    () =>
      normalizedTimeline.map((point, index) => ({
        value: index,
        label: point.label,
      })),
    [normalizedTimeline]
  )

  const frameInterval = useMemo(() => 1000 / Math.max(fps, 1), [fps])

  const stopPlayback = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimestampRef.current = 0
    accumulationRef.current = 0
  }, [])

  useEffect(() => {
    if (!isPlaying || normalizedTimeline.length <= 1) {
      stopPlayback()
      return
    }

    const playLoop = timestamp => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp
        rafRef.current = requestAnimationFrame(playLoop)
        return
      }

      const delta = timestamp - lastTimestampRef.current
      if (delta >= frameInterval) {
        accumulationRef.current += delta
        lastTimestampRef.current = timestamp

        if (accumulationRef.current >= playInterval) {
          accumulationRef.current -= playInterval
          changeSourceRef.current = 'auto'
          setCurrentIndex(prev => (prev + 1) % normalizedTimeline.length)
        }
      }

      rafRef.current = requestAnimationFrame(playLoop)
    }

    rafRef.current = requestAnimationFrame(playLoop)
    return stopPlayback
  }, [frameInterval, isPlaying, normalizedTimeline.length, playInterval, stopPlayback])

  useEffect(() => {
    if (changeSourceRef.current === 'auto') {
      onTick?.(currentIndex)
      changeSourceRef.current = 'manual'
    }
  }, [currentIndex, onTick])

  const handleSeek = index => {
    const nextIndex = clamp(index, 0, normalizedTimeline.length - 1)
    changeSourceRef.current = 'manual'
    setCurrentIndex(nextIndex)
    onSeek?.(nextIndex)
  }

  const handleSliderChange = (_, value) => {
    handleSeek(value)
  }

  const handleKeyDown = event => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleSeek(currentIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handleSeek(currentIndex - 1)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev)
  }

  const handleRestart = () => {
    handleSeek(0)
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight="bold">
          Timeline Control
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Restart timeline">
            <span>
              <IconButton
                size="small"
                onClick={handleRestart}
                aria-label="Restart timeline"
                disabled={currentIndex === 0 && !isPlaying}
              >
                <Replay fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isPlaying ? 'Pause playback' : 'Play timeline'}>
            <IconButton
              color={isPlaying ? 'secondary' : 'primary'}
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
              size="small"
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Chip
        label={`Current: ${currentPoint.label}`}
        color="primary"
        variant="outlined"
        sx={{ alignSelf: 'flex-start' }}
      />

      <Box
        onKeyDown={handleKeyDown}
        tabIndex={0}
        sx={{ outline: 'none' }}
        aria-label="Timeline scrubber"
      >
        <Slider
          value={currentIndex}
          onChange={handleSliderChange}
          min={0}
          max={normalizedTimeline.length - 1}
          step={1}
          marks={sliderMarks}
          valueLabelDisplay="auto"
          valueLabelFormat={value => normalizedTimeline[value]?.label ?? `${value}`}
          sx={{
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
            },
            '& .MuiSlider-track': {
              height: 6,
            },
            '& .MuiSlider-rail': {
              height: 6,
            },
            '& .MuiSlider-markLabel': {
              fontSize: '0.7rem',
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f0f7ff',
          borderRadius: 1,
          border: '1px solid #1976d2',
          p: 1.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {isPlaying ? 'Playing playback' : 'Ready to scrub'}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary">
          {currentPoint.label}
        </Typography>
      </Box>
    </Box>
  )
}

TimelineControl.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      meta: PropTypes.any,
    })
  ),
  initialIndex: PropTypes.number,
  playInterval: PropTypes.number,
  fps: PropTypes.number,
  onTick: PropTypes.func,
  onSeek: PropTypes.func,
}
