import PropTypes from 'prop-types'
import { Chip } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import './RiskBadge.css'

/**
 * Animated risk badge with accessibility support
 * @param {Object} props
 * @param {'low'|'medium'|'high'|'critical'} props.level - Risk level
 * @param {string} props.label - Optional custom label
 * @param {'small'|'medium'} props.size - Badge size
 * @param {boolean} props.showIcon - Show icon in badge
 */
function RiskBadge({ level = 'low', label, size = 'medium', showIcon = true }) {
  // Configuration for each risk level
  const riskConfig = {
    low: {
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: '#4caf50',
      label: 'Low Risk',
      icon: CheckCircleIcon,
      textColor: '#2e7d32'
    },
    medium: {
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      borderColor: '#ff9800',
      label: 'Medium Risk',
      icon: InfoIcon,
      textColor: '#e65100'
    },
    high: {
      color: '#f44336',
      bgColor: 'rgba(244, 67, 54, 0.1)',
      borderColor: '#f44336',
      label: 'High Risk',
      icon: WarningIcon,
      textColor: '#c62828'
    },
    critical: {
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.15)',
      borderColor: '#b71c1c',
      label: 'Critical',
      icon: ErrorIcon,
      textColor: '#b71c1c'
    }
  }

  const config = riskConfig[level] || riskConfig.low
  const Icon = config.icon
  const displayLabel = label || config.label

  return (
    <Chip
      icon={showIcon ? <Icon sx={{ fontSize: size === 'small' ? 16 : 18, color: config.color }} /> : undefined}
      label={displayLabel}
      size={size}
      className={`risk-badge risk-badge-${level}`}
      sx={{
        bgcolor: config.bgColor,
        color: config.textColor,
        border: `2px solid ${config.borderColor}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        '& .MuiChip-icon': {
          marginLeft: size === 'small' ? '4px' : '6px'
        }
      }}
    />
  )
}

RiskBadge.propTypes = {
  level: PropTypes.oneOf(['low', 'medium', 'high', 'critical']).isRequired,
  label: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
  showIcon: PropTypes.bool
}

export default RiskBadge
