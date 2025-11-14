import { 
  Paper, 
  Box, 
  Typography, 
  Divider 
} from '@mui/material'
import SquareIcon from '@mui/icons-material/Square'
import CircleIcon from '@mui/icons-material/Circle'

// Updated legend items for risk zones and fire hotspots
const LEGEND_ITEMS = [
  { id: 1, label: 'Low Risk Zone', color: '#4caf50', icon: 'zone', opacity: 0.5 },
  { id: 2, label: 'Medium Risk Zone', color: '#ff9800', icon: 'zone', opacity: 0.6 },
  { id: 3, label: 'High Risk Zone', color: '#f44336', icon: 'zone', opacity: 0.7 },
  { id: 4, label: 'Fire Hotspots', color: '#ff4444', icon: 'fire' },
  { id: 5, label: 'Low Risk Location', color: '#4caf50', icon: 'circle' },
  { id: 6, label: 'Medium Risk Location', color: '#ff9800', icon: 'circle' },
  { id: 7, label: 'High Risk Location', color: '#f44336', icon: 'circle' },
]

function Legend() {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        minWidth: 200,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        Legend
      </Typography>
      <Divider sx={{ mb: 1 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        {LEGEND_ITEMS.map((item) => (
          <Box 
            key={item.id} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5 
            }}
          >
            {item.icon === 'zone' && (
              <SquareIcon 
                sx={{ 
                  fontSize: 18, 
                  color: item.color,
                  opacity: item.opacity || 0.5
                }} 
              />
            )}
            {item.icon === 'fire' && (
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: 1
                }}
              >
                <Typography sx={{ fontSize: 10 }}>🔥</Typography>
              </Box>
            )}
            {item.icon === 'circle' && (
              <CircleIcon 
                sx={{ 
                  fontSize: 14, 
                  color: item.color,
                  opacity: 0.9
                }} 
              />
            )}
            <Typography variant="body2" fontSize={12}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Additional Info */}
      <Divider sx={{ my: 1.5 }} />
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          🌍 Risk Zones: Green/Yellow/Red
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          🔥 Fire Hotspots: Real-time detection
        </Typography>
      </Box>
    </Paper>
  )
}

export default Legend
