import { Box, Stack, Typography, Paper, Divider } from '@mui/material'
import RiskBadge from './RiskBadge'

/**
 * Example usage of RiskBadge component
 */
function RiskBadgeExample() {
  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        RiskBadge Component Examples
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Animated risk badges with accessibility support (respects prefers-reduced-motion)
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* All levels */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Risk Levels
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <RiskBadge level="low" />
          <RiskBadge level="medium" />
          <RiskBadge level="high" />
          <RiskBadge level="critical" />
        </Stack>
      </Paper>

      {/* Size variations */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Size Variations
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Small Size
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <RiskBadge level="low" size="small" />
              <RiskBadge level="medium" size="small" />
              <RiskBadge level="high" size="small" />
              <RiskBadge level="critical" size="small" />
            </Stack>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Medium Size (Default)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <RiskBadge level="low" size="medium" />
              <RiskBadge level="medium" size="medium" />
              <RiskBadge level="high" size="medium" />
              <RiskBadge level="critical" size="medium" />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Custom labels */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Custom Labels
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <RiskBadge level="low" label="Safe" />
          <RiskBadge level="medium" label="Moderate" />
          <RiskBadge level="high" label="Danger" />
          <RiskBadge level="critical" label="URGENT" />
        </Stack>
      </Paper>

      {/* Without icons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Without Icons
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <RiskBadge level="low" showIcon={false} />
          <RiskBadge level="medium" showIcon={false} />
          <RiskBadge level="high" showIcon={false} />
          <RiskBadge level="critical" showIcon={false} />
        </Stack>
      </Paper>

      {/* Critical variations */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Critical Badge Animations
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          The critical badge features:
        </Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Typography variant="body2">
              <strong>Pulsating shadow</strong> - Subtle glow that expands and contracts
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Heartbeat scale</strong> - Quick double-pulse animation
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Icon pulse</strong> - Icon opacity and scale animation
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Accessibility</strong> - Respects prefers-reduced-motion
            </Typography>
          </li>
        </ul>
        <Stack direction="row" spacing={2} mt={2}>
          <RiskBadge level="critical" label="FIRE DETECTED" />
          <RiskBadge level="critical" label="EVACUATION" size="small" />
          <RiskBadge level="critical" label="IMMEDIATE ACTION" />
        </Stack>
      </Paper>

      {/* Use cases */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Practical Examples
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Fire Alert Status
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Zone A:</Typography>
              <RiskBadge level="low" label="Clear" size="small" />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Weather Conditions
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Region:</Typography>
              <RiskBadge level="medium" label="Watch" size="small" />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Emergency Alert
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Priority:</Typography>
              <RiskBadge level="critical" label="CRITICAL" size="small" />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Accessibility note */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
        <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
          ♿ Accessibility Features
        </Typography>
        <Typography variant="body2">
          • Animations disabled with <code>prefers-reduced-motion: reduce</code>
        </Typography>
        <Typography variant="body2">
          • Enhanced borders in <code>prefers-contrast: high</code>
        </Typography>
        <Typography variant="body2">
          • Keyboard focus indicators
        </Typography>
        <Typography variant="body2">
          • Semantic color coding with icons
        </Typography>
      </Paper>
    </Box>
  )
}

export default RiskBadgeExample
