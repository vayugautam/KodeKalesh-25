import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Stack,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import MapIcon from '@mui/icons-material/Map'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DownloadIcon from '@mui/icons-material/Download'
import ScheduleIcon from '@mui/icons-material/Schedule'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import ChartComponent from '../components/ChartComponent'
import MapComponent from '../components/MapComponent'

const STAT_CARDS = [
  {
    label: 'Active Fires',
    value: '12',
    change: '+3 today',
    icon: <LocalFireDepartmentIcon sx={{ color: '#ff7043', fontSize: 32 }} />,
    accent: '#ffccbc',
  },
  {
    label: 'Critical Alerts',
    value: '5',
    change: '2 escalated',
    icon: <WarningAmberIcon sx={{ color: '#ffa726', fontSize: 32 }} />,
    accent: '#ffe0b2',
  },
  {
    label: 'High-Risk Zones',
    value: '18',
    change: 'Across 6 states',
    icon: <MapIcon sx={{ color: '#42a5f5', fontSize: 32 }} />,
    accent: '#bbdefb',
  },
  {
    label: 'Reports Sent (24h)',
    value: '27',
    change: '8 auto-generated',
    icon: <AssessmentIcon sx={{ color: '#66bb6a', fontSize: 32 }} />,
    accent: '#c8e6c9',
  },
]

const QUICK_ACTIONS = [
  { label: 'View Live Map', path: '/', icon: <MapIcon /> },
  { label: 'Alert Console', path: '/alerts', icon: <WarningAmberIcon /> },
  { label: 'Download Report', path: '/reports', icon: <DownloadIcon /> },
]

const ACTIVITY_FEED = [
  { time: '09:42', title: 'Thermal anomaly detected', detail: 'Sentinel-2 pass flagged rising temps near Wardha range.' },
  { time: '09:10', title: 'Report shared with control room', detail: 'North region 6-hour projection emailed to NDMA desk.' },
  { time: '08:55', title: 'Crew readiness check', detail: 'All six strike teams acknowledged availability for dispatch.' },
]

const CHECKLIST = [
  'Confirm satellite ingest pipeline is running',
  'Validate weather feed latency < 5 mins',
  'Broadcast alert summaries to districts',
  'Stage aerial assets at nearest strips',
]

function Home() {
  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 8, minHeight: '150vh' }}>
      {/* Hero Section */}
      <Paper
        id="hero"
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #42a5f5 100%)',
          color: 'white',
          scrollMarginTop: '80px',
        }}
      >
        <Stack spacing={3}>
          <Chip
            label="Live monitoring window • updated every 5 minutes"
            sx={{
              width: 'fit-content',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Typography variant="h3" fontWeight={700}>
            Unified command center for wildland fire readiness
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 720, opacity: 0.9 }}>
            Track ignition risks, review predictive reports, and deploy teams from one dashboard. Fire behavior
            forecasts, weather overlays, and alert automation run continuously so you can act within minutes.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<FlashOnIcon />}
            >
              Launch Live Operations
            </Button>
            <Button
              component={RouterLink}
              to="/reports"
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<DownloadIcon />}
              sx={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white' }}
            >
              View Situation Reports
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Statistics Section */}
      <Grid container spacing={3} id="statistics" sx={{ scrollMarginTop: '80px' }}>
        {STAT_CARDS.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: card.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.change}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dashboard Section */}
      <Grid container spacing={3} sx={{ mt: 1 }} id="dashboard">
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <div>
                <Typography variant="h6" fontWeight={600}>
                  7-Day Risk Trajectory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overlay of user reports and satellite-derived ignition probabilities
                </Typography>
              </div>
              <Chip label="Updated 8 mins ago" size="small" color="primary" variant="outlined" />
            </Stack>
            <ChartComponent />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Quick Actions
              </Typography>
              {QUICK_ACTIONS.map(action => (
                <Button
                  key={action.label}
                  component={RouterLink}
                  to={action.path}
                  variant="outlined"
                  startIcon={action.icon}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {action.label}
                </Button>
              ))}
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Shift lead tip: lock in the live map before briefing to freeze telemetry on the shared screen.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Activity Section */}
      <Grid container spacing={3} sx={{ mt: 0 }} id="activity">
        <Grid item xs={12} lg={7}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {ACTIVITY_FEED.map(item => (
                <ListItem key={item.title} alignItems="flex-start" disableGutters sx={{ pb: 1 }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={item.time} size="small" icon={<ScheduleIcon fontSize="inherit" />} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.title}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {item.detail}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Readiness Checklist
            </Typography>
            <Stack spacing={1.5}>
              {CHECKLIST.map(item => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px dashed rgba(0,0,0,0.1)',
                  }}
                >
                  <FlashOnIcon color="primary" />
                  <Typography variant="body2">{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Map Section */}
      <Box sx={{ mt: 3 }} id="map-preview">
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Live Observation Map
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hover over markers to inspect the latest hotspots. Full-screen analytics live under the Map view.
          </Typography>
          <MapComponent />
        </Paper>
      </Box>
    </Container>
  )
}

export default Home
