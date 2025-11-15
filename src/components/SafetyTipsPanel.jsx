import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Tooltip,
  Chip,
  Stack,
  Divider,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import AirIcon from '@mui/icons-material/Air'
import OpacityIcon from '@mui/icons-material/Opacity'

const tips = [
  {
    category: 'Fire Prevention',
    icon: <LocalFireDepartmentIcon />,
    color: '#ff5722',
    items: [
      'Clear dry vegetation within 30 feet of structures',
      'Never leave campfires unattended',
      'Report smoke immediately via emergency hotline',
      'Avoid outdoor burning on high-risk days',
    ],
  },
  {
    category: 'Weather Factors',
    icon: <WbSunnyIcon />,
    color: '#ffa726',
    items: [
      'Temperature above 35°C increases fire risk significantly',
      'Relative humidity below 30% creates critical conditions',
      'Strong winds can rapidly spread fires',
      'Lightning strikes are common ignition sources',
    ],
  },
  {
    category: 'Risk Indicators',
    icon: <AirIcon />,
    color: '#42a5f5',
    items: [
      'Red/Orange risk: Avoid any fire-related activities',
      'Yellow risk: Exercise extreme caution',
      'Green risk: Normal precautions apply',
      'Check daily risk levels before outdoor activities',
    ],
  },
  {
    category: 'Emergency Response',
    icon: <OpacityIcon />,
    color: '#66bb6a',
    items: [
      'Keep emergency kit ready during fire season',
      'Know evacuation routes from your area',
      'Sign up for local emergency alerts',
      'Create defensible space around properties',
    ],
  },
]

const SafetyTipsPanel = () => {
  const [expanded, setExpanded] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length)
    }, 8000) // Rotate every 8 seconds

    return () => clearInterval(interval)
  }, [])

  const currentTip = tips[currentTipIndex]

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 100,
        left: 24,
        width: expanded ? 350 : 280,
        zIndex: 1000,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      }}
    >
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${currentTip.color} 0%, ${currentTip.color}dd 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TipsAndUpdatesIcon />
          <Typography variant="subtitle1" fontWeight={600}>
            Safety Tips
          </Typography>
        </Stack>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: `${currentTip.color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentTip.color,
            }}
          >
            {currentTip.icon}
          </Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {currentTip.category}
          </Typography>
        </Stack>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {currentTip.items.map((item, idx) => (
              <Box key={idx} sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  • {item}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {tips.map((tip, idx) => (
              <Chip
                key={idx}
                label={tip.category}
                size="small"
                onClick={() => setCurrentTipIndex(idx)}
                sx={{
                  backgroundColor: currentTipIndex === idx ? `${tip.color}22` : 'transparent',
                  borderColor: tip.color,
                  color: tip.color,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: `${tip.color}33`,
                  },
                }}
                variant={currentTipIndex === idx ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Collapse>

        {!expanded && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {currentTip.items[0]}
          </Typography>
        )}
      </Box>

      {!expanded && (
        <Box
          sx={{
            height: 3,
            background: `linear-gradient(90deg, ${currentTip.color} 0%, transparent 100%)`,
            animation: 'progress 8s linear infinite',
            '@keyframes progress': {
              from: { width: '0%' },
              to: { width: '100%' },
            },
          }}
        />
      )}
    </Paper>
  )
}

export default SafetyTipsPanel
