import PropTypes from 'prop-types'
import { 
  Box, 
  Typography, 
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Paper,
  Divider
} from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle'

const SIDEBAR_WIDTH = 400

const REGIONS = [
  'India',
  'North India',
  'South India',
  'East India',
  'West India',
  'Central India',
  'Northeast India'
]

function Sidebar({ onFetchPrediction, selectedRegion, setSelectedRegion, selectedDate, setSelectedDate }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100vh',
        borderRadius: 0,
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white'
      }}
    >
      <Box sx={{ p: 4, flexGrow: 1 }}>
        {/* Title */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 5,
            fontWeight: 700,
            fontSize: '2.5rem',
            textAlign: 'center'
          }}
        >
          FireGuard AI
        </Typography>

        {/* Region Dropdown */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            Region:
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              sx={{
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                }
              }}
            >
              {REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Date Picker */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            Date:
          </Typography>
          <TextField
            type="date"
            fullWidth
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputProps={{
              sx: {
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                }
              }
            }}
            placeholder="Select Date"
          />
        </Box>

        {/* Fetch Prediction Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={onFetchPrediction}
          sx={{
            bgcolor: '#1a1a1a',
            color: 'white',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1,
            mb: 5,
            '&:hover': {
              bgcolor: '#333'
            }
          }}
        >
          Fetch Prediction
        </Button>

        <Divider sx={{ mb: 3 }} />

        {/* Legend */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontWeight: 700,
              fontSize: '1.5rem'
            }}
          >
            Legend
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Low Risk */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircleIcon 
                sx={{ 
                  fontSize: 28,
                  color: '#4caf50'
                }} 
              />
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                Low Risk
              </Typography>
            </Box>

            {/* Medium Risk */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircleIcon 
                sx={{ 
                  fontSize: 28,
                  color: '#ffd54f'
                }} 
              />
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                Medium Risk
              </Typography>
            </Box>

            {/* High Risk */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircleIcon 
                sx={{ 
                  fontSize: 28,
                  color: '#e57373'
                }} 
              />
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                High Risk
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Data Sources Footer */}
      <Box 
        sx={{ 
          p: 2.5,
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#fafafa',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
          Data Sources: Open-Meteo, NASA FIRMS
        </Typography>
      </Box>
    </Paper>
  )
}

export default Sidebar

Sidebar.propTypes = {
  onFetchPrediction: PropTypes.func,
  selectedRegion: PropTypes.string.isRequired,
  setSelectedRegion: PropTypes.func.isRequired,
  selectedDate: PropTypes.string.isRequired,
  setSelectedDate: PropTypes.func.isRequired,
}
